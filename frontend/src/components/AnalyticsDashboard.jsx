import React, { useState, useEffect, useCallback } from 'react';
import { 
  Users, Eye, MousePointer, Monitor, Smartphone, Tablet,
  Globe, TrendingUp, Clock, RefreshCw, Calendar, Filter,
  ArrowUp, ArrowDown, Activity, Zap
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { analyticsApi } from '../services/api';

const AnalyticsDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('7d');
  const [customDates, setCustomDates] = useState({ start: '', end: '' });
  const [overview, setOverview] = useState(null);
  const [pageviews, setPageviews] = useState([]);
  const [timeline, setTimeline] = useState([]);
  const [devices, setDevices] = useState(null);
  const [trafficSources, setTrafficSources] = useState(null);
  const [realtime, setRealtime] = useState(null);
  const [actions, setActions] = useState([]);
  const [activeView, setActiveView] = useState('overview'); // overview, realtime

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const startDate = period === 'custom' ? customDates.start : null;
      const endDate = period === 'custom' ? customDates.end : null;
      
      const [overviewData, pageviewsData, timelineData, devicesData, sourcesData, actionsData] = await Promise.all([
        analyticsApi.getOverview(period, startDate, endDate),
        analyticsApi.getPageviews(period, startDate, endDate),
        analyticsApi.getTimeline(period, 'day', startDate, endDate),
        analyticsApi.getDevices(period, startDate, endDate),
        analyticsApi.getTrafficSources(period, startDate, endDate),
        analyticsApi.getActions(period, startDate, endDate)
      ]);
      
      setOverview(overviewData);
      setPageviews(pageviewsData.pages || []);
      setTimeline(timelineData.timeline || []);
      setDevices(devicesData);
      setTrafficSources(sourcesData);
      setActions(actionsData.actions || []);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  }, [period, customDates]);

  const loadRealtime = useCallback(async () => {
    try {
      const data = await analyticsApi.getRealtime();
      setRealtime(data);
    } catch (error) {
      console.error('Error loading realtime:', error);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (activeView === 'realtime') {
      loadRealtime();
      const interval = setInterval(loadRealtime, 10000); // Update every 10 seconds
      return () => clearInterval(interval);
    }
  }, [activeView, loadRealtime]);

  const periods = [
    { value: 'today', label: 'Hoje' },
    { value: 'yesterday', label: 'Ontem' },
    { value: '7d', label: '7 dias' },
    { value: '30d', label: '30 dias' },
    { value: 'this_month', label: 'Este mês' },
    { value: 'last_month', label: 'Mês anterior' },
    { value: 'custom', label: 'Personalizado' }
  ];

  const getDeviceIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'mobile': return <Smartphone className="w-4 h-4" />;
      case 'tablet': return <Tablet className="w-4 h-4" />;
      default: return <Monitor className="w-4 h-4" />;
    }
  };

  const formatNumber = (num) => {
    if (!num) return '0';
    return num.toLocaleString('pt-BR');
  };

  const getPercentage = (value, total) => {
    if (!total || !value) return '0%';
    return ((value / total) * 100).toFixed(1) + '%';
  };

  // Render bar for chart
  const renderBar = (item, index, max, color) => (
    <div key={index} className="flex items-center gap-3">
      <div className="w-24 text-xs text-slate-600 truncate" title={item.label}>
        {item.label}
      </div>
      <div className="flex-1 h-6 bg-slate-100 rounded overflow-hidden">
        <div 
          className={`h-full bg-${color}-500 rounded transition-all duration-500`}
          style={{ width: `${(item.value / max) * 100}%` }}
        />
      </div>
      <div className="w-16 text-right text-sm font-medium text-slate-700">
        {formatNumber(item.value)}
      </div>
    </div>
  );

  // Render timeline bar
  const renderTimelineBar = (item, index, maxValue, chartHeight) => {
    const height = ((item.pageviews || 0) / maxValue) * chartHeight;
    return (
      <div key={index} className="flex-1 flex flex-col items-center group">
        <div className="relative w-full">
          <div 
            className="w-full bg-emerald-500 rounded-t hover:bg-emerald-600 transition-colors cursor-pointer"
            style={{ height: Math.max(height, 2) }}
          />
          <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap z-10">
            {item.pageviews} views
          </div>
        </div>
      </div>
    );
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
      {/* Header with filters */}
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
                className={period === p.value ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
              >
                {p.label}
              </Button>
            ))}
          </div>
        )}
      </div>

      {/* Custom date range */}
      {period === 'custom' && activeView === 'overview' && (
        <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-500" />
            <input
              type="date"
              value={customDates.start}
              onChange={e => setCustomDates(prev => ({ ...prev, start: e.target.value }))}
              className="px-3 py-1.5 border rounded text-sm"
            />
            <span className="text-slate-500">até</span>
            <input
              type="date"
              value={customDates.end}
              onChange={e => setCustomDates(prev => ({ ...prev, end: e.target.value }))}
              className="px-3 py-1.5 border rounded text-sm"
            />
          </div>
          <Button size="sm" onClick={loadData} className="bg-emerald-600">
            Aplicar
          </Button>
        </div>
      )}

      {/* Realtime View */}
      {activeView === 'realtime' && (
        <div className="space-y-6">
          {/* Online Now */}
          <Card className="border-0 shadow-lg bg-gradient-to-r from-emerald-500 to-emerald-600 text-white">
            <CardContent className="py-8">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-100 text-sm font-medium">Usuários Online Agora</p>
                  <p className="text-5xl font-bold mt-2">{realtime?.online_now || 0}</p>
                </div>
                <div className="relative">
                  <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
                    <Zap className="w-8 h-8" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full animate-pulse" />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Active Sessions */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Users className="w-5 h-5 text-emerald-600" />
                  Sessões Ativas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {realtime?.online_sessions?.length > 0 ? (
                    realtime.online_sessions.map((session, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          {getDeviceIcon(session.device_type)}
                          <div>
                            <p className="text-sm font-medium text-slate-700">
                              {session.pages?.[session.pages.length - 1] || '/'}
                            </p>
                            <p className="text-xs text-slate-500">
                              {session.pageviews || session.pages?.length || 1} páginas visitadas
                            </p>
                          </div>
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

            {/* Recent Pageviews */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Eye className="w-5 h-5 text-emerald-600" />
                  Visualizações Recentes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {realtime?.recent_pageviews?.length > 0 ? (
                    realtime.recent_pageviews.slice(0, 10).map((pv, index) => (
                      <div key={index} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                        <div className="flex items-center gap-2">
                          {getDeviceIcon(pv.device_type)}
                          <span className="text-sm text-slate-700">{pv.page}</span>
                        </div>
                        <span className="text-xs text-slate-500">
                          {new Date(pv.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-slate-500 text-sm text-center py-4">Nenhuma visualização recente</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Overview View */}
      {activeView === 'overview' && (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="border-0 shadow-lg">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500">Visualizações</p>
                    <p className="text-2xl font-bold text-slate-900">{formatNumber(overview?.total_pageviews)}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Eye className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500">Visitantes Únicos</p>
                    <p className="text-2xl font-bold text-slate-900">{formatNumber(overview?.unique_visitors)}</p>
                  </div>
                  <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                    <Users className="w-6 h-6 text-emerald-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500">Sessões</p>
                    <p className="text-2xl font-bold text-slate-900">{formatNumber(overview?.total_sessions)}</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <Clock className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-r from-emerald-500 to-emerald-600 text-white">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-emerald-100">Online Agora</p>
                    <p className="text-2xl font-bold">{formatNumber(overview?.online_now)}</p>
                  </div>
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <Zap className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Timeline Chart */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
                Visualizações ao Longo do Tempo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <TimelineChart data={timeline} />
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Top Pages */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5 text-emerald-600" />
                  Páginas Mais Visitadas
                </CardTitle>
              </CardHeader>
              <CardContent>
                {pageviews.length > 0 ? (
                  <SimpleBarChart 
                    data={pageviews.slice(0, 5).map(p => ({ 
                      label: p.page || '/', 
                      value: p.views 
                    }))}
                  />
                ) : (
                  <p className="text-slate-500 text-sm">Sem dados</p>
                )}
              </CardContent>
            </Card>

            {/* Devices */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Monitor className="w-5 h-5 text-emerald-600" />
                  Dispositivos
                </CardTitle>
              </CardHeader>
              <CardContent>
                {devices?.devices?.length > 0 ? (
                  <div className="space-y-4">
                    {devices.devices.map((device, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {getDeviceIcon(device.name)}
                          <span className="text-sm text-slate-700 capitalize">{device.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-2 bg-slate-100 rounded overflow-hidden">
                            <div 
                              className="h-full bg-emerald-500 rounded"
                              style={{ width: getPercentage(device.count, overview?.total_pageviews) }}
                            />
                          </div>
                          <span className="text-sm font-medium text-slate-600 w-12 text-right">
                            {getPercentage(device.count, overview?.total_pageviews)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-500 text-sm">Sem dados</p>
                )}
              </CardContent>
            </Card>

            {/* Traffic Sources */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5 text-emerald-600" />
                  Fontes de Tráfego (UTM)
                </CardTitle>
              </CardHeader>
              <CardContent>
                {trafficSources?.sources?.length > 0 ? (
                  <SimpleBarChart 
                    data={trafficSources.sources.slice(0, 5).map(s => ({ 
                      label: s.name, 
                      value: s.count 
                    }))}
                    color="blue"
                  />
                ) : (
                  <p className="text-slate-500 text-sm">Nenhum tráfego com UTM</p>
                )}
              </CardContent>
            </Card>

            {/* Actions */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MousePointer className="w-5 h-5 text-emerald-600" />
                  Ações dos Usuários
                </CardTitle>
              </CardHeader>
              <CardContent>
                {actions.length > 0 ? (
                  <SimpleBarChart 
                    data={actions.slice(0, 5).map(a => ({ 
                      label: a.action?.replace(/_/g, ' '), 
                      value: a.count 
                    }))}
                    color="purple"
                  />
                ) : (
                  <p className="text-slate-500 text-sm">Nenhuma ação rastreada</p>
                )}
              </CardContent>
            </Card>

            {/* Browsers */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5 text-emerald-600" />
                  Navegadores
                </CardTitle>
              </CardHeader>
              <CardContent>
                {devices?.browsers?.length > 0 ? (
                  <SimpleBarChart 
                    data={devices.browsers.slice(0, 5).map(b => ({ 
                      label: b.name, 
                      value: b.count 
                    }))}
                    color="amber"
                  />
                ) : (
                  <p className="text-slate-500 text-sm">Sem dados</p>
                )}
              </CardContent>
            </Card>

            {/* Operating Systems */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Monitor className="w-5 h-5 text-emerald-600" />
                  Sistemas Operacionais
                </CardTitle>
              </CardHeader>
              <CardContent>
                {devices?.operating_systems?.length > 0 ? (
                  <SimpleBarChart 
                    data={devices.operating_systems.slice(0, 5).map(os => ({ 
                      label: os.name, 
                      value: os.count 
                    }))}
                    color="rose"
                  />
                ) : (
                  <p className="text-slate-500 text-sm">Sem dados</p>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
};

export default AnalyticsDashboard;
