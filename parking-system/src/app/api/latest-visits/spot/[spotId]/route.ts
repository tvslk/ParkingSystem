import pool from '../../../../../../lib/db';
import { getSession } from '@auth0/nextjs-auth0';
import { RowDataPacket } from 'mysql2';

interface DatabaseRow extends RowDataPacket {
  spot_id: number;
  availability: number;
  created_at: string;
}

export async function GET(_: Request, { params }: { params: { spotId: string } }) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    const { spotId } = params;
    if (!spotId || isNaN(Number(spotId))) {
      return new Response(JSON.stringify({ error: "Valid Spot ID is required" }), { status: 400 });
    }

    const [rows] = await pool.query<DatabaseRow[]>(
      'SELECT spot_id, availability, created_at ' +
      'FROM parking_spots ' +
      'WHERE spot_id = ? ' +
      'ORDER BY created_at DESC',
      [spotId]
    );

  //  console.log(`Raw DB rows for spot ${spotId}:`, rows);

    // Process state changes
    const stateChanges: DatabaseRow[] = [];
    let previousAvailability: number | null = null;
    
    // Filter consecutive duplicates and maintain chronological order
    const chronologicalRows = [...rows].reverse();
    for (const row of chronologicalRows) {
      const currentAvailability = Number(row.availability);
      if (currentAvailability !== previousAvailability) {
        stateChanges.push(row);
        previousAvailability = currentAvailability;
      }
    }

   // console.log(`Filtered state changes for spot ${spotId}:`, stateChanges);

    // Build visits from state changes
    const visits: Array<{ startDate: string; endDate?: string }> = [];
    let currentVisit: { startDate: string; endDate?: string } | null = null;

    for (const change of stateChanges) {
      const availability = Number(change.availability);
      
      if (availability === 0) {
        // Start new visit only if not already in one
        if (!currentVisit) {
          currentVisit = { startDate: change.created_at };
         // console.log(`Visit started at ${change.created_at}`);
        }
      } else if (availability === 1) {
        // End existing visit if there's one to close
        if (currentVisit) {
          currentVisit.endDate = change.created_at;
          visits.push(currentVisit);
         // console.log(`Visit ended at ${change.created_at}`, currentVisit);
          currentVisit = null;
        }
      }
    }

    // Add any ongoing visit
    if (currentVisit) {
      visits.push(currentVisit);
     // console.log(`Ongoing visit at ${currentVisit.startDate}`);
    }

    // Return visits in reverse chronological order
    const orderedVisits = visits.reverse();
   // console.log(`Final visits for spot ${spotId}:`, orderedVisits);

    return new Response(JSON.stringify(orderedVisits), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error(`Error processing spot ${params.spotId}:`, error);
    return new Response(
      JSON.stringify({ error: "Failed to process visits", details: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500 }
    );
  }
}