import React, { useState, useEffect, useCallback } from 'react';
import { Users, Eye, Monitor, Smartphone, TrendingUp, Clock, RefreshCw, Calendar, Filter, Activity, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { analyticsApi } from '../services/api';

const AnalyticsDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('7d');
  const [overview, setOverview] = useState(null);
  const [pageviews, setPageviews] = useState([]);
  const [devices, setDevices] = useState(null);
  const [realtime, setRealtime] = useState(null);
  const [activeView, setActiveView] = useState('overview');

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [overviewData, pageviewsData, devicesData] = await Promise.all([
        analyticsApi.getOverview(period),
        analyticsApi.getPageviews(period),
        analyticsApi.getDevices(period)
      ]);
      setOverview(overviewData);
      setPageviews(pageviewsData.pages || []);
      setDevices(devicesData);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  }, [period]);

  const loadRealtime = useCallback(async () => {
    try {
      const data = await analyticsApi.getRealtime();
      setRealtime(data);
    } catch (error) {
      console.error('Error loading realtime:', error);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  useEffect(() => {
    if (activeView === 'realtime') {
      loadRealtime();
      const interval = setInterval(loadRealtime, 10000);
      return () => clearInterval(interval);
    }
  }, [activeView, loadRealtime]);

  const periods = [
    { value: 'today', label: 'Hoje' },
    { value: '7d', label: '7 dias' },
    { value: '30d', label: '30 dias' },
    { value: 'this_month', label: 'Este mês' }
  ];

  const formatNumber = (num) => (num || 0).toLocaleString('pt-BR');
  
  const getDeviceIcon = (type) => {
    if (type?.toLowerCase() === 'mobile') return <Smartphone className="w-4 h-4" />;
    return <Monitor className="w-4 h-4" />;
  };

  if (loading && !overview) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-2">
          <Button
            variant={activeView === 'overview' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveView('overview')}
            className={activeView === 'overview' ? 'bg-emerald-600' : ''}
          >
            <TrendingUp className="w-4 h-4 mr-1" /> Visão Geral
          </Button>
          <Button
            variant={activeView === 'realtime' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveView('realtime')}
            className={activeView === 'realtime' ? 'bg-emerald-600' : ''}
          >
            <Activity className="w-4 h-4 mr-1" /> Tempo Real
          </Button>
        </div>
        
        {activeView === 'overview' && (
          <div className="flex flex-wrap items-center gap-2">
            <Filter className="w-4 h-4 text-slate-500" />
            {periods.map(p => (
              <Button
                key={p.value}
                variant={period === p.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPeriod(p.value)}
                className={period === p.value ? 'bg-emerald-600' : ''}
              >
                {p.label}
              </Button>
            ))}
          </div>
        )}
      </div>

      {/* Realtime View */}
      {activeView === 'realtime' && (
        <div className="space-y-6">
          <Card className="border-0 shadow-lg bg-gradient-to-r from-emerald-500 to-emerald-600 text-white">
            <CardContent className="py-8">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-100 text-sm">Usuários Online Agora</p>
                  <p className="text-5xl font-bold mt-2">{realtime?.online_now || 0}</p>
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
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {realtime?.online_sessions?.length > 0 ? (
                  realtime.online_sessions.map((session, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        {getDeviceIcon(session.device_type)}
                        <span className="text-sm">{session.pages?.[session.pages.length - 1] || '/'}</span>
                      </div>
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    </div>
                  ))
                ) : (
                  <p className="text-slate-500 text-sm text-center py-4">Nenhuma sessão ativa</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Overview View */}
      {activeView === 'overview' && (
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="border-0 shadow-lg">
              <CardContent className="pt-6">
                <p className="text-sm text-slate-500">Visualizações</p>
                <p className="text-2xl font-bold">{formatNumber(overview?.total_pageviews)}</p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-lg">
              <CardContent className="pt-6">
                <p className="text-sm text-slate-500">Visitantes Únicos</p>
                <p className="text-2xl font-bold">{formatNumber(overview?.unique_visitors)}</p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-lg">
              <CardContent className="pt-6">
                <p className="text-sm text-slate-500">Sessões</p>
                <p className="text-2xl font-bold">{formatNumber(overview?.total_sessions)}</p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-lg bg-emerald-600 text-white">
              <CardContent className="pt-6">
                <p className="text-sm text-emerald-100">Online Agora</p>
                <p className="text-2xl font-bold">{formatNumber(overview?.online_now)}</p>
              </CardContent>
            </Card>
          </div>

          {/* Pages */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-emerald-600" /> Páginas Mais Visitadas
              </CardTitle>
            </CardHeader>
            <CardContent>
              {pageviews.length > 0 ? (
                <div className="space-y-3">
                  {pageviews.slice(0, 5).map((page, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm text-slate-700">{page.page || '/'}</span>
                      <span className="font-medium">{formatNumber(page.views)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 text-sm">Sem dados</p>
              )}
            </CardContent>
          </Card>

          {/* Devices */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Monitor className="w-5 h-5 text-emerald-600" /> Dispositivos
              </CardTitle>
            </CardHeader>
            <CardContent>
              {devices?.devices?.length > 0 ? (
                <div className="space-y-3">
                  {devices.devices.map((device, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getDeviceIcon(device.name)}
                        <span className="text-sm capitalize">{device.name}</span>
                      </div>
                      <span className="font-medium">{formatNumber(device.count)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 text-sm">Sem dados</p>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AnalyticsDashboard;
