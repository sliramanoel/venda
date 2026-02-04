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

  const loadStats = async () => {
    setLoading(true);
    try {
      const data = await analyticsApi.getOverview(period);
      setStats(data);
    } catch (err) {
      console.error('Error:', err);
    }
    setLoading(false);
  };

  const loadRealtime = async () => {
    try {
      const data = await analyticsApi.getRealtime();
      setRealtime(data);
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const fmt = (n) => (n || 0).toLocaleString('pt-BR');

  if (loading && !stats) {
    return (
      <div className="flex justify-center py-12">
        <RefreshCw className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

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
          <Activity className="w-4 h-4 mr-1" /> Tempo Real
        </Button>
        
        {view === 'overview' && (
          <>
            <span className="mx-2 text-slate-300">|</span>
            {['today', '7d', '30d', 'this_month'].map(p => (
              <Button
                key={p}
                size="sm"
                variant={period === p ? 'default' : 'outline'}
                onClick={() => setPeriod(p)}
                className={period === p ? 'bg-emerald-600' : ''}
              >
                {p === 'today' ? 'Hoje' : p === '7d' ? '7 dias' : p === '30d' ? '30 dias' : 'Mês'}
              </Button>
            ))}
          </>
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
                <Users className="w-5 h-5 text-emerald-600" /> Sessões Ativas
              </CardTitle>
            </CardHeader>
            <CardContent>
              {realtime?.online_sessions?.length > 0 ? (
                <div className="space-y-2">
                  {realtime.online_sessions.map((s, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded">
                      <div className="flex items-center gap-2">
                        {s.device_type === 'mobile' ? <Smartphone className="w-4 h-4" /> : <Monitor className="w-4 h-4" />}
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
