/**
 * Mock Catapult Connector
 * In a real scenario, this would use the Catapult OpenField API or parse a CSV export.
 */
const fetchMockCatapultData = async (athleteId) => {
  // Simulating an API call
  return {
    source: 'catapult',
    athlete_id: athleteId,
    timestamp: new Date().toISOString(),
    metrics: [
      { type: 'total_distance', value: 5200, unit: 'm' },
      { type: 'high_intensity_sprints', value: 12, unit: 'count' },
      { type: 'player_load', value: 450, unit: 'au' },
      { type: 'max_velocity', value: 31.5, unit: 'km/h' },
    ],
  };
};

module.exports = {
  fetchMockCatapultData,
};
