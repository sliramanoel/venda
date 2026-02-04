import React, { useState, useEffect } from 'react';
import { Users, Eye, Monitor, Smartphone, RefreshCw, Activity, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { analyticsApi } from '../services/api';

const AnalyticsDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('7d');
  const [stats, setStats] = useState(null);
  const [realtime, setRealtime] = useState(null);
  const [view, setView] = useState('overview');

  useEffect(() => {
    loadStats();
  }, [period]);

  useEffect(() => {
    if (view === 'realtime') {
      loadRealtime();
      const interval = setInterval(loadRealtime, 10000);
      return () => clearInterval(interval);
    }
  }, [view]);

  const loadStats = () => {
    setLoading(true);
    analyticsApi.getOverview(period)
      .then(data => setStats(data))
      .catch(err => console.error('Error:', err))
      .finally(() => setLoading(false));
  };

  const loadRealtime = () => {
    analyticsApi.getRealtime()
      .then(data => setRealtime(data))
      .catch(err => console.error('Error:', err));
  };

  const fmt = n => (n || 0).toLocaleString('pt-BR');

  if (loading && !stats) {
    return (
      <div className="flex justify-center py-12">
        <RefreshCw className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  const periods = [
    { key: 'today', label: 'Hoje' },
    { key: '7d', label: '7 dias' },
    { key: '30d', label: '30 dias' },
    { key: 'this_month', label: 'Mês' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          variant={view === 'overview' ? 'default' : 'outline'}
          onClick={() => setView('overview')}
          className={view === 'overview' ? 'bg-emerald-600' : ''}
        >
          Visão Geral
        </Button>
        <Button
          size="sm"
          variant={view === 'realtime' ? 'default' : 'outline'}
          onClick={() => setView('realtime')}
          className={view === 'realtime' ? 'bg-emerald-600' : ''}
        >
          <Activity className="w-4 h-4 mr-1" />
          Tempo Real
        </Button>
        
        {view === 'overview' && (
          <React.Fragment>
            <span className="mx-2 text-slate-300">|</span>
            {periods.map(p => (
              <Button
                key={p.key}
                size="sm"
                variant={period === p.key ? 'default' : 'outline'}
                onClick={() => setPeriod(p.key)}
                className={period === p.key ? 'bg-emerald-600' : ''}
              >
                {p.label}
              </Button>
            ))}
          </React.Fragment>
        )}
      </div>

      {view === 'realtime' ? (
        <div className="space-y-4">
          <Card className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white border-0">
            <CardContent className="py-8">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-100">Usuários Online</p>
                  <p className="text-5xl font-bold">{realtime?.online_now || 0}</p>
                </div>
                <Zap className="w-12 h-12 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-600" />
                Sessões Ativas
              </CardTitle>
            </CardHeader>
            <CardContent>
              {realtime?.online_sessions?.length > 0 ? (
                <div className="space-y-2">
                  {realtime.online_sessions.map((s, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded">
                      <div className="flex items-center gap-2">
                        {s.device_type === 'mobile' ? (
                          <Smartphone className="w-4 h-4" />
                        ) : (
                          <Monitor className="w-4 h-4" />
                        )}
                        <span className="text-sm">{s.pages?.[s.pages.length - 1] || '/'}</span>
                      </div>
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 text-center py-4">Nenhuma sessão ativa</p>
              )}
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="border-0 shadow-lg">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Eye className="w-8 h-8 text-blue-500" />
                <div>
                  <p className="text-sm text-slate-500">Visualizações</p>
                  <p className="text-2xl font-bold">{fmt(stats?.total_pageviews)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Users className="w-8 h-8 text-emerald-500" />
                <div>
                  <p className="text-sm text-slate-500">Visitantes</p>
                  <p className="text-2xl font-bold">{fmt(stats?.unique_visitors)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Monitor className="w-8 h-8 text-purple-500" />
                <div>
                  <p className="text-sm text-slate-500">Sessões</p>
                  <p className="text-2xl font-bold">{fmt(stats?.total_sessions)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-emerald-600 text-white">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Zap className="w-8 h-8 text-emerald-200" />
                <div>
                  <p className="text-sm text-emerald-100">Online</p>
                  <p className="text-2xl font-bold">{fmt(stats?.online_now)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AnalyticsDashboard;
