const normalize = (rawData) => {
  const { source, athlete_id, timestamp, metrics } = rawData;
  return metrics.map((m) => ({
    athlete_id,
    source,
    metric_type: m.type,
    value: { val: m.value }, // Wrapped for JSONB flexibility
    unit: m.unit,
    captured_at: timestamp,
    is_stale: false,
  }));
};

module.exports = {
  normalize,
};
