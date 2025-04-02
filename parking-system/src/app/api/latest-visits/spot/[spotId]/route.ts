import pool from '../../../../../../lib/db';
import { getSession } from '@auth0/nextjs-auth0';
import { RowDataPacket } from 'mysql2';
import { useAuthStatus } from '@/app/hooks/useAuthStatus';
import { isUserAdmin } from '@/actions/isUserAdmin';
import { NextResponse } from 'next/server';

interface DatabaseRow extends RowDataPacket {
  spot_id: number;
  availability: number;
  created_at: string;
}

export async function GET(_: Request, { params }: { params: { spotId: string } }) {
  try {
    const session = await getSession();
    const isAdmin = await isUserAdmin();
    if (!session?.user || !isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { spotId } = params;
    if (!spotId || isNaN(Number(spotId))) {
      return NextResponse.json({ error: "Valid Spot ID is required" }, { status: 400 });
    }

    const [rows] = await pool.query<DatabaseRow[]>(
      'SELECT spot_id, availability, created_at ' +
      'FROM parking_spots ' +
      'WHERE spot_id = ? ' +
      'ORDER BY created_at DESC',
      [spotId]
    );

    const stateChanges: DatabaseRow[] = [];
    let previousAvailability: number | null = null;
    
    const chronologicalRows = [...rows].reverse();
    for (const row of chronologicalRows) {
      const currentAvailability = Number(row.availability);
      if (currentAvailability !== previousAvailability) {
        stateChanges.push(row);
        previousAvailability = currentAvailability;
      }
    }

    const visits: Array<{ startDate: string; endDate?: string }> = [];
    let currentVisit: { startDate: string; endDate?: string } | null = null;

    for (const change of stateChanges) {
      const availability = Number(change.availability);
      
      if (availability === 0) {
        if (!currentVisit) {
          currentVisit = { startDate: change.created_at };
        }
      } else if (availability === 1) {
        if (currentVisit) {
          currentVisit.endDate = change.created_at;
          visits.push(currentVisit);
          currentVisit = null;
        }
      }
    }

    if (currentVisit) {
      visits.push(currentVisit);
    }

    const orderedVisits = visits.reverse();
    return NextResponse.json(orderedVisits, {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error(`Error processing spot ${params.spotId}:`, error);
    return NextResponse.json(
      { error: "Failed to process visits", details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}