import { useEffect, useState } from 'react';
import {
  Activity, Wind, Thermometer, Droplets, Zap, Gauge,
  Volume2, Search, RefreshCw, Filter,
} from 'lucide-react';
import { supabase, type Sensor, type Mine, type SensorType } from '@/lib/supabase';
import { Badge, statusColor, timeAgo } from '@/components/ui/Badge';
import { Card, CardHeader, LoadingSpinner, EmptyState, ProgressBar } from '@/components/ui';

const sensorIcons: Record<SensorType, React.ReactNode> = {
  gas: <Wind className="h-4 w-4" />,
  temperature: <Thermometer className="h-4 w-4" />,
  humidity: <Droplets className="h-4 w-4" />,
  vibration: <Zap className="h-4 w-4" />,
  air_quality: <Gauge className="h-4 w-4" />,
  water_level: <Droplets className="h-4 w-4" />,
  dust: <Wind className="h-4 w-4" />,
  noise: <Volume2 className="h-4 w-4" />,
};

export function Sensors() {
  const [sensors, setSensors] = useState<Sensor[]>([]);
  const [mines, setMines] = useState<Mine[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    async function load() {
      const [s, m] = await Promise.all([
        supabase.from('sensors').select('*').order('created_at', { ascending: false }),
        supabase.from('mines').select('*'),
      ]);
      setSensors(s.data ?? []);
      setMines(m.data ?? []);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) return <LoadingSpinner label="Loading sensors..." />;

  const mineName = (id: string) => mines.find((m) => m.id === id)?.name ?? 'Unknown';
  const filtered = sensors.filter((s) => {
    const matchSearch =
      s.location_description.toLowerCase().includes(search.toLowerCase()) ||
      mineName(s.mine_id).toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === 'all' || s.sensor_type === typeFilter;
    const matchStatus = statusFilter === 'all' || s.status === statusFilter;
    return matchSearch && matchType && matchStatus;
  });

  const online = sensors.filter((s) => s.status === 'online').length;
  const offline = sensors.filter((s) => s.status === 'offline').length;
  const maintenance = sensors.filter((s) => s.status === 'maintenance').length;
  const inWarning = sensors.filter((s) => s.current_value !== null && s.threshold_warning !== null && s.current_value >= s.threshold_warning && (s.threshold_critical === null || s.current_value < s.threshold_critical)).length;
  const inCritical = sensors.filter((s) => s.current_value !== null && s.threshold_critical !== null && s.current_value >= s.threshold_critical).length;

  return (
    <div className="space-y-6">
      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-lg border border-green-500/20 bg-green-500/10 p-3">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            <p className="text-xs text-green-400 font-medium">Online</p>
          </div>
          <p className="text-xl font-bold text-gray-100 mt-1">{online}</p>
        </div>
        <div className="rounded-lg border border-gray-500/20 bg-gray-500/10 p-3">
          <p className="text-xs text-gray-400 font-medium">Offline</p>
          <p className="text-xl font-bold text-gray-100 mt-1">{offline}</p>
        </div>
        <div className="rounded-lg border border-orange-500/20 bg-orange-500/10 p-3">
          <p className="text-xs text-orange-400 font-medium">Maintenance</p>
          <p className="text-xl font-bold text-gray-100 mt-1">{maintenance}</p>
        </div>
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3">
          <p className="text-xs text-red-400 font-medium">Threshold Breached</p>
          <p className="text-xl font-bold text-gray-100 mt-1">{inWarning + inCritical}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by mine or location..."
            className="w-full rounded-lg border border-gray-700/50 bg-gray-800/50 py-2 pl-9 pr-4 text-sm text-gray-200 placeholder-gray-500 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/30"
          />
        </div>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="rounded-lg border border-gray-700/50 bg-gray-800/50 px-3 py-2 text-sm text-gray-200 focus:border-cyan-500/50 focus:outline-none"
        >
          <option value="all">All Types</option>
          <option value="gas">Gas</option>
          <option value="temperature">Temperature</option>
          <option value="humidity">Humidity</option>
          <option value="vibration">Vibration</option>
          <option value="air_quality">Air Quality</option>
          <option value="water_level">Water Level</option>
          <option value="dust">Dust</option>
          <option value="noise">Noise</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-gray-700/50 bg-gray-800/50 px-3 py-2 text-sm text-gray-200 focus:border-cyan-500/50 focus:outline-none"
        >
          <option value="all">All Status</option>
          <option value="online">Online</option>
          <option value="offline">Offline</option>
          <option value="maintenance">Maintenance</option>
          <option value="calibrating">Calibrating</option>
        </select>
      </div>

      {/* Sensor grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((sensor) => {
          const isCritical = sensor.current_value !== null && sensor.threshold_critical !== null && sensor.current_value >= sensor.threshold_critical;
          const isWarning = sensor.current_value !== null && sensor.threshold_warning !== null && sensor.current_value >= sensor.threshold_warning && !isCritical;
          const pct = sensor.threshold_critical !== null && sensor.current_value !== null
            ? Math.min(100, (sensor.current_value / sensor.threshold_critical) * 100)
            : 0;

          return (
            <Card key={sensor.id} className="p-4 hover:border-gray-600/60 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                    sensor.status === 'online' ? 'bg-cyan-500/10 text-cyan-400' :
                    sensor.status === 'offline' ? 'bg-gray-700/50 text-gray-500' :
                    'bg-orange-500/10 text-orange-400'
                  }`}>
                    {sensorIcons[sensor.sensor_type]}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-200 capitalize">{sensor.sensor_type.replace('_', ' ')}</p>
                    <p className="text-[10px] text-gray-500">{mineName(sensor.mine_id)}</p>
                  </div>
                </div>
                <Badge color={statusColor(sensor.status)}>{sensor.status}</Badge>
              </div>

              <p className="text-xs text-gray-400 mb-3 flex items-center gap-1">
                <Activity className="h-3 w-3" /> {sensor.location_description}
              </p>

              <div className="rounded-lg bg-gray-800/40 p-3">
                <div className="flex items-baseline justify-between mb-2">
                  <div>
                    <span className={`text-2xl font-bold ${
                      isCritical ? 'text-red-400' : isWarning ? 'text-orange-400' : 'text-gray-100'
                    }`}>
                      {sensor.current_value ?? '—'}
                    </span>
                    <span className="text-xs text-gray-400 ml-1">{sensor.unit}</span>
                  </div>
                  {(isWarning || isCritical) && (
                    <span className={`text-xs font-medium ${isCritical ? 'text-red-400' : 'text-orange-400'} flex items-center gap-1`}>
                      {isCritical ? 'CRITICAL' : 'WARNING'}
                    </span>
                  )}
                </div>
                <ProgressBar
                  value={pct}
                  color={isCritical ? 'red' : isWarning ? 'orange' : 'green'}
                  className="h-1.5"
                />
                <div className="flex justify-between mt-1.5 text-[10px] text-gray-500">
                  <span>Warning: {sensor.threshold_warning ?? '—'}{sensor.unit}</span>
                  <span>Critical: {sensor.threshold_critical ?? '—'}{sensor.unit}</span>
                </div>
              </div>

              <p className="text-[10px] text-gray-500 mt-2 flex items-center gap-1">
                <RefreshCw className="h-3 w-3" /> Last reading: {timeAgo(sensor.last_reading_at)}
              </p>
            </Card>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <EmptyState title="No sensors found" message="Try adjusting your filters" icon={<Filter className="h-10 w-10" />} />
      )}
    </div>
  );
}
