import React, { useState, useEffect } from 'react';
import { Users, Eye, Monitor, Smartphone, RefreshCw, Activity, Zap, Clock, TrendingDown, MousePointer, Globe, ChevronDown, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { analyticsApi } from '../services/api';

function AnalyticsDashboard() {
  var _React = React;
  var _useState = _React.useState;
  var _useEffect = _React.useEffect;
  var _createElement = _React.createElement;

  var loadingState = _useState(true);
  var loading = loadingState[0];
  var setLoading = loadingState[1];

  var periodState = _useState('7d');
  var period = periodState[0];
  var setPeriod = periodState[1];

  var statsState = _useState(null);
  var stats = statsState[0];
  var setStats = statsState[1];

  var realtimeState = _useState(null);
  var realtime = realtimeState[0];
  var setRealtime = realtimeState[1];

  var pageviewsState = _useState([]);
  var pageviews = pageviewsState[0];
  var setPageviews = pageviewsState[1];

  var devicesState = _useState(null);
  var devices = devicesState[0];
  var setDevices = devicesState[1];

  var sourcesState = _useState(null);
  var sources = sourcesState[0];
  var setSources = sourcesState[1];

  var viewState = _useState('overview');
  var view = viewState[0];
  var setView = viewState[1];

  var expandedSessionState = _useState(null);
  var expandedSession = expandedSessionState[0];
  var setExpandedSession = expandedSessionState[1];

  _useEffect(function() {
    loadAllData();
  }, [period]);

  _useEffect(function() {
    if (view === 'realtime') {
      loadRealtime();
      var interval = setInterval(loadRealtime, 5000);
      return function() { clearInterval(interval); };
    }
  }, [view]);

  function loadAllData() {
    setLoading(true);
    Promise.all([
      analyticsApi.getOverview(period),
      analyticsApi.getPageviews(period),
      analyticsApi.getDevices(period),
      analyticsApi.getTrafficSources(period)
    ]).then(function(results) {
      setStats(results[0]);
      setPageviews(results[1].pages || []);
      setDevices(results[2]);
      setSources(results[3]);
    }).catch(function(err) {
      console.error('Error:', err);
    }).finally(function() {
      setLoading(false);
    });
  }

  function loadRealtime() {
    analyticsApi.getRealtime()
      .then(function(data) { setRealtime(data); })
      .catch(function(err) { console.error('Error:', err); });
  }

  function fmt(n) { return (n || 0).toLocaleString('pt-BR'); }
  
  function formatTime(seconds) {
    if (!seconds) return '0s';
    if (seconds < 60) return Math.round(seconds) + 's';
    var mins = Math.floor(seconds / 60);
    var secs = Math.round(seconds % 60);
    return mins + 'm ' + secs + 's';
  }

  function getPageName(path) {
    if (!path || path === '/') return 'Página Inicial';
    var names = {
      '/vendas': 'Página de Vendas',
      '/comprar': 'Checkout',
      '/pagamento': 'Pagamento',
      '/sucesso': 'Compra Concluída',
      '/faq': 'FAQ',
      '/quem-somos': 'Quem Somos',
      '/admin': 'Admin',
      '/login': 'Login'
    };
    return names[path] || path;
  }

  if (loading && !stats) {
    return _createElement('div', { className: 'flex justify-center py-12' },
      _createElement(RefreshCw, { className: 'w-8 h-8 animate-spin text-emerald-600' })
    );
  }

  // Period buttons
  var periods = [
    { key: 'today', label: 'Hoje' },
    { key: 'yesterday', label: 'Ontem' },
    { key: '7d', label: '7 dias' },
    { key: '30d', label: '30 dias' },
    { key: 'this_month', label: 'Este mês' }
  ];

  var periodButtons = periods.map(function(p) {
    return _createElement(Button, {
      key: p.key,
      size: 'sm',
      variant: period === p.key ? 'default' : 'outline',
      onClick: function() { setPeriod(p.key); },
      className: period === p.key ? 'bg-emerald-600 hover:bg-emerald-700' : ''
    }, p.label);
  });

  // Header with tabs
  var header = _createElement('div', { className: 'flex flex-col gap-4' },
    _createElement('div', { className: 'flex flex-wrap items-center gap-2' },
      _createElement(Button, {
        size: 'sm',
        variant: view === 'overview' ? 'default' : 'outline',
        onClick: function() { setView('overview'); },
        className: view === 'overview' ? 'bg-emerald-600' : ''
      }, 
        _createElement(Eye, { className: 'w-4 h-4 mr-1' }),
        'Visão Geral'
      ),
      _createElement(Button, {
        size: 'sm',
        variant: view === 'realtime' ? 'default' : 'outline',
        onClick: function() { setView('realtime'); },
        className: view === 'realtime' ? 'bg-emerald-600' : ''
      }, 
        _createElement(Activity, { className: 'w-4 h-4 mr-1' }),
        'Tempo Real'
      ),
      _createElement(Button, {
        size: 'sm',
        variant: view === 'pages' ? 'default' : 'outline',
        onClick: function() { setView('pages'); },
        className: view === 'pages' ? 'bg-emerald-600' : ''
      }, 
        _createElement(Globe, { className: 'w-4 h-4 mr-1' }),
        'Páginas'
      ),
      _createElement(Button, {
        size: 'sm',
        variant: view === 'visitors' ? 'default' : 'outline',
        onClick: function() { setView('visitors'); },
        className: view === 'visitors' ? 'bg-emerald-600' : ''
      }, 
        _createElement(Users, { className: 'w-4 h-4 mr-1' }),
        'Visitantes'
      )
    ),
    view !== 'realtime' ? _createElement('div', { className: 'flex flex-wrap items-center gap-2' },
      _createElement('span', { className: 'text-sm text-slate-500 mr-2' }, 'Período:'),
      periodButtons
    ) : null
  );

  // Stats cards for overview
  var statsCards = _createElement('div', { className: 'grid grid-cols-2 lg:grid-cols-5 gap-4' },
    _createElement(Card, { className: 'border-0 shadow-lg' },
      _createElement(CardContent, { className: 'pt-6' },
        _createElement('div', { className: 'flex items-center gap-3' },
          _createElement('div', { className: 'w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center' },
            _createElement(Eye, { className: 'w-5 h-5 text-blue-600' })
          ),
          _createElement('div', null,
            _createElement('p', { className: 'text-xs text-slate-500' }, 'Visualizações'),
            _createElement('p', { className: 'text-xl font-bold' }, fmt(stats && stats.total_pageviews))
          )
        )
      )
    ),
    _createElement(Card, { className: 'border-0 shadow-lg' },
      _createElement(CardContent, { className: 'pt-6' },
        _createElement('div', { className: 'flex items-center gap-3' },
          _createElement('div', { className: 'w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center' },
            _createElement(Users, { className: 'w-5 h-5 text-emerald-600' })
          ),
          _createElement('div', null,
            _createElement('p', { className: 'text-xs text-slate-500' }, 'Visitantes'),
            _createElement('p', { className: 'text-xl font-bold' }, fmt(stats && stats.unique_visitors))
          )
        )
      )
    ),
    _createElement(Card, { className: 'border-0 shadow-lg' },
      _createElement(CardContent, { className: 'pt-6' },
        _createElement('div', { className: 'flex items-center gap-3' },
          _createElement('div', { className: 'w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center' },
            _createElement(MousePointer, { className: 'w-5 h-5 text-purple-600' })
          ),
          _createElement('div', null,
            _createElement('p', { className: 'text-xs text-slate-500' }, 'Sessões'),
            _createElement('p', { className: 'text-xl font-bold' }, fmt(stats && stats.total_sessions))
          )
        )
      )
    ),
    _createElement(Card, { className: 'border-0 shadow-lg' },
      _createElement(CardContent, { className: 'pt-6' },
        _createElement('div', { className: 'flex items-center gap-3' },
          _createElement('div', { className: 'w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center' },
            _createElement(Clock, { className: 'w-5 h-5 text-amber-600' })
          ),
          _createElement('div', null,
            _createElement('p', { className: 'text-xs text-slate-500' }, 'Pág/Sessão'),
            _createElement('p', { className: 'text-xl font-bold' }, 
              stats && stats.total_sessions > 0 
                ? (stats.total_pageviews / stats.total_sessions).toFixed(1) 
                : '0'
            )
          )
        )
      )
    ),
    _createElement(Card, { className: 'border-0 shadow-lg bg-emerald-600 text-white' },
      _createElement(CardContent, { className: 'pt-6' },
        _createElement('div', { className: 'flex items-center gap-3' },
          _createElement('div', { className: 'w-10 h-10 rounded-full bg-white/20 flex items-center justify-center' },
            _createElement(Zap, { className: 'w-5 h-5' })
          ),
          _createElement('div', null,
            _createElement('p', { className: 'text-xs text-emerald-100' }, 'Online'),
            _createElement('p', { className: 'text-xl font-bold' }, fmt(stats && stats.online_now))
          )
        )
      )
    )
  );

  // Top pages card
  var topPagesCard = _createElement(Card, { className: 'border-0 shadow-lg' },
    _createElement(CardHeader, { className: 'pb-2' },
      _createElement(CardTitle, { className: 'text-base flex items-center gap-2' },
        _createElement(Globe, { className: 'w-4 h-4 text-emerald-600' }),
        'Páginas Mais Visitadas'
      )
    ),
    _createElement(CardContent, null,
      pageviews.length > 0 
        ? _createElement('div', { className: 'space-y-2' },
            pageviews.slice(0, 5).map(function(page, i) {
              var maxViews = pageviews[0].views;
              var width = Math.max(10, (page.views / maxViews) * 100);
              return _createElement('div', { key: i, className: 'space-y-1' },
                _createElement('div', { className: 'flex justify-between text-sm' },
                  _createElement('span', { className: 'text-slate-700 truncate', style: { maxWidth: '200px' } }, getPageName(page.page)),
                  _createElement('span', { className: 'font-medium text-slate-900' }, fmt(page.views) + ' views')
                ),
                _createElement('div', { className: 'h-2 bg-slate-100 rounded-full overflow-hidden' },
                  _createElement('div', { 
                    className: 'h-full bg-emerald-500 rounded-full',
                    style: { width: width + '%' }
                  })
                )
              );
            })
          )
        : _createElement('p', { className: 'text-slate-500 text-sm text-center py-4' }, 'Sem dados')
    )
  );

  // Devices card
  var devicesCard = _createElement(Card, { className: 'border-0 shadow-lg' },
    _createElement(CardHeader, { className: 'pb-2' },
      _createElement(CardTitle, { className: 'text-base flex items-center gap-2' },
        _createElement(Monitor, { className: 'w-4 h-4 text-emerald-600' }),
        'Dispositivos'
      )
    ),
    _createElement(CardContent, null,
      devices && devices.devices && devices.devices.length > 0 
        ? _createElement('div', { className: 'space-y-3' },
            devices.devices.map(function(d, i) {
              var total = devices.devices.reduce(function(sum, x) { return sum + x.count; }, 0);
              var pct = total > 0 ? ((d.count / total) * 100).toFixed(0) : 0;
              return _createElement('div', { key: i, className: 'flex items-center justify-between' },
                _createElement('div', { className: 'flex items-center gap-2' },
                  d.name === 'mobile' 
                    ? _createElement(Smartphone, { className: 'w-4 h-4 text-slate-500' })
                    : _createElement(Monitor, { className: 'w-4 h-4 text-slate-500' }),
                  _createElement('span', { className: 'text-sm capitalize' }, d.name)
                ),
                _createElement('div', { className: 'flex items-center gap-2' },
                  _createElement('div', { className: 'w-20 h-2 bg-slate-100 rounded-full overflow-hidden' },
                    _createElement('div', { 
                      className: 'h-full bg-blue-500 rounded-full',
                      style: { width: pct + '%' }
                    })
                  ),
                  _createElement('span', { className: 'text-sm font-medium w-12 text-right' }, pct + '%')
                )
              );
            })
          )
        : _createElement('p', { className: 'text-slate-500 text-sm text-center py-4' }, 'Sem dados')
    )
  );

  // Traffic sources card
  var sourcesCard = _createElement(Card, { className: 'border-0 shadow-lg' },
    _createElement(CardHeader, { className: 'pb-2' },
      _createElement(CardTitle, { className: 'text-base flex items-center gap-2' },
        _createElement(TrendingDown, { className: 'w-4 h-4 text-emerald-600' }),
        'Fontes de Tráfego'
      )
    ),
    _createElement(CardContent, null,
      sources && sources.sources && sources.sources.length > 0 
        ? _createElement('div', { className: 'space-y-2' },
            sources.sources.slice(0, 5).map(function(s, i) {
              return _createElement('div', { key: i, className: 'flex items-center justify-between py-1 border-b border-slate-100 last:border-0' },
                _createElement('span', { className: 'text-sm text-slate-700' }, s.name || 'Direto'),
                _createElement('span', { className: 'text-sm font-medium' }, fmt(s.count))
              );
            })
          )
        : _createElement('p', { className: 'text-slate-500 text-sm text-center py-4' }, 'Sem tráfego via UTM')
    )
  );

  // Browsers card  
  var browsersCard = _createElement(Card, { className: 'border-0 shadow-lg' },
    _createElement(CardHeader, { className: 'pb-2' },
      _createElement(CardTitle, { className: 'text-base flex items-center gap-2' },
        _createElement(Globe, { className: 'w-4 h-4 text-emerald-600' }),
        'Navegadores'
      )
    ),
    _createElement(CardContent, null,
      devices && devices.browsers && devices.browsers.length > 0 
        ? _createElement('div', { className: 'space-y-2' },
            devices.browsers.slice(0, 4).map(function(b, i) {
              return _createElement('div', { key: i, className: 'flex items-center justify-between py-1' },
                _createElement('span', { className: 'text-sm text-slate-700' }, b.name),
                _createElement('span', { className: 'text-sm font-medium' }, fmt(b.count))
              );
            })
          )
        : _createElement('p', { className: 'text-slate-500 text-sm text-center py-4' }, 'Sem dados')
    )
  );

  // Overview view
  var overviewView = _createElement('div', { className: 'space-y-6' },
    statsCards,
    _createElement('div', { className: 'grid md:grid-cols-2 gap-6' },
      topPagesCard,
      devicesCard
    ),
    _createElement('div', { className: 'grid md:grid-cols-2 gap-6' },
      sourcesCard,
      browsersCard
    )
  );

  // Realtime view with detailed sessions
  var realtimeView = _createElement('div', { className: 'space-y-4' },
    _createElement(Card, { className: 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white border-0' },
      _createElement(CardContent, { className: 'py-6' },
        _createElement('div', { className: 'flex items-center justify-between' },
          _createElement('div', null,
            _createElement('p', { className: 'text-emerald-100 text-sm' }, 'Usuários Online Agora'),
            _createElement('p', { className: 'text-4xl font-bold' }, (realtime && realtime.online_now) || 0)
          ),
          _createElement('div', { className: 'text-right' },
            _createElement('p', { className: 'text-emerald-100 text-sm' }, 'Última atualização'),
            _createElement('p', { className: 'text-lg' }, new Date().toLocaleTimeString('pt-BR'))
          )
        )
      )
    ),
    _createElement(Card, { className: 'border-0 shadow-lg' },
      _createElement(CardHeader, null,
        _createElement(CardTitle, { className: 'flex items-center gap-2' },
          _createElement(Users, { className: 'w-5 h-5 text-emerald-600' }),
          'Sessões Ativas - Detalhes do Visitante'
        )
      ),
      _createElement(CardContent, null,
        (realtime && realtime.online_sessions && realtime.online_sessions.length > 0)
          ? _createElement('div', { className: 'space-y-3' },
              realtime.online_sessions.map(function(session, i) {
                var isExpanded = expandedSession === i;
                var lastPage = session.pages && session.pages.length > 0 
                  ? session.pages[session.pages.length - 1] 
                  : '/';
                var pageCount = session.pages ? session.pages.length : 0;
                
                return _createElement('div', { 
                  key: i, 
                  className: 'border border-slate-200 rounded-lg overflow-hidden'
                },
                  _createElement('div', { 
                    className: 'flex items-center justify-between p-3 bg-slate-50 cursor-pointer hover:bg-slate-100',
                    onClick: function() { setExpandedSession(isExpanded ? null : i); }
                  },
                    _createElement('div', { className: 'flex items-center gap-3' },
                      _createElement('div', { className: 'w-2 h-2 bg-green-500 rounded-full animate-pulse' }),
                      session.device_type === 'mobile'
                        ? _createElement(Smartphone, { className: 'w-4 h-4 text-slate-500' })
                        : _createElement(Monitor, { className: 'w-4 h-4 text-slate-500' }),
                      _createElement('div', null,
                        _createElement('p', { className: 'text-sm font-medium' }, 'Visitante #' + (i + 1)),
                        _createElement('p', { className: 'text-xs text-slate-500' }, 
                          pageCount + ' página(s) visitada(s)'
                        )
                      )
                    ),
                    _createElement('div', { className: 'flex items-center gap-3' },
                      _createElement('div', { className: 'text-right' },
                        _createElement('p', { className: 'text-sm font-medium text-emerald-600' }, getPageName(lastPage)),
                        _createElement('p', { className: 'text-xs text-slate-500' }, 'Página atual')
                      ),
                      isExpanded 
                        ? _createElement(ChevronDown, { className: 'w-4 h-4 text-slate-400' })
                        : _createElement(ChevronRight, { className: 'w-4 h-4 text-slate-400' })
                    )
                  ),
                  isExpanded && session.pages && session.pages.length > 0
                    ? _createElement('div', { className: 'p-3 bg-white border-t border-slate-200' },
                        _createElement('p', { className: 'text-xs font-medium text-slate-500 mb-2' }, 'JORNADA DO VISITANTE'),
                        _createElement('div', { className: 'space-y-1' },
                          session.pages.map(function(page, j) {
                            var isLast = j === session.pages.length - 1;
                            return _createElement('div', { key: j, className: 'flex items-center gap-2' },
                              _createElement('div', { 
                                className: 'w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ' +
                                  (isLast ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600')
                              }, j + 1),
                              _createElement('span', { 
                                className: 'text-sm ' + (isLast ? 'font-medium text-emerald-700' : 'text-slate-600')
                              }, getPageName(page)),
                              isLast 
                                ? _createElement('span', { className: 'text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded' }, 'atual')
                                : null
                            );
                          })
                        )
                      )
                    : null
                );
              })
            )
          : _createElement('div', { className: 'text-center py-8' },
              _createElement(Users, { className: 'w-12 h-12 text-slate-300 mx-auto mb-3' }),
              _createElement('p', { className: 'text-slate-500' }, 'Nenhum visitante online no momento'),
              _createElement('p', { className: 'text-xs text-slate-400 mt-1' }, 'Os visitantes aparecerão aqui em tempo real')
            )
      )
    )
  );

  // Pages view - detailed page analytics
  var pagesView = _createElement('div', { className: 'space-y-4' },
    _createElement(Card, { className: 'border-0 shadow-lg' },
      _createElement(CardHeader, null,
        _createElement(CardTitle, { className: 'flex items-center gap-2' },
          _createElement(Globe, { className: 'w-5 h-5 text-emerald-600' }),
          'Análise de Páginas'
        )
      ),
      _createElement(CardContent, null,
        pageviews.length > 0
          ? _createElement('div', { className: 'overflow-x-auto' },
              _createElement('table', { className: 'w-full' },
                _createElement('thead', null,
                  _createElement('tr', { className: 'border-b border-slate-200' },
                    _createElement('th', { className: 'text-left py-3 px-2 text-sm font-medium text-slate-600' }, 'Página'),
                    _createElement('th', { className: 'text-right py-3 px-2 text-sm font-medium text-slate-600' }, 'Views'),
                    _createElement('th', { className: 'text-right py-3 px-2 text-sm font-medium text-slate-600' }, 'Visitantes'),
                    _createElement('th', { className: 'text-right py-3 px-2 text-sm font-medium text-slate-600' }, '% do Total')
                  )
                ),
                _createElement('tbody', null,
                  pageviews.map(function(page, i) {
                    var totalViews = pageviews.reduce(function(sum, p) { return sum + p.views; }, 0);
                    var pct = totalViews > 0 ? ((page.views / totalViews) * 100).toFixed(1) : 0;
                    return _createElement('tr', { key: i, className: 'border-b border-slate-100 hover:bg-slate-50' },
                      _createElement('td', { className: 'py-3 px-2' },
                        _createElement('div', null,
                          _createElement('p', { className: 'text-sm font-medium text-slate-800' }, getPageName(page.page)),
                          _createElement('p', { className: 'text-xs text-slate-400' }, page.page)
                        )
                      ),
                      _createElement('td', { className: 'text-right py-3 px-2 font-medium' }, fmt(page.views)),
                      _createElement('td', { className: 'text-right py-3 px-2 text-slate-600' }, fmt(page.unique_visitors)),
                      _createElement('td', { className: 'text-right py-3 px-2' },
                        _createElement('div', { className: 'flex items-center justify-end gap-2' },
                          _createElement('div', { className: 'w-16 h-2 bg-slate-100 rounded-full overflow-hidden' },
                            _createElement('div', { 
                              className: 'h-full bg-emerald-500 rounded-full',
                              style: { width: pct + '%' }
                            })
                          ),
                          _createElement('span', { className: 'text-sm w-12 text-right' }, pct + '%')
                        )
                      )
                    );
                  })
                )
              )
            )
          : _createElement('p', { className: 'text-slate-500 text-center py-8' }, 'Sem dados de páginas')
      )
    )
  );

  // Visitors view - detailed visitor list
  var visitorsView = _createElement('div', { className: 'space-y-4' },
    _createElement(Card, { className: 'border-0 shadow-lg' },
      _createElement(CardHeader, null,
        _createElement(CardTitle, { className: 'flex items-center gap-2' },
          _createElement(Users, { className: 'w-5 h-5 text-emerald-600' }),
          'Visitantes Recentes'
        ),
        _createElement('p', { className: 'text-sm text-slate-500 mt-1' }, 
          'Visualize a jornada completa de cada visitante'
        )
      ),
      _createElement(CardContent, null,
        (realtime && realtime.recent_pageviews && realtime.recent_pageviews.length > 0)
          ? _createElement('div', { className: 'space-y-2' },
              realtime.recent_pageviews.slice(0, 20).map(function(pv, i) {
                return _createElement('div', { 
                  key: i, 
                  className: 'flex items-center justify-between p-2 rounded hover:bg-slate-50'
                },
                  _createElement('div', { className: 'flex items-center gap-3' },
                    pv.device_type === 'mobile'
                      ? _createElement(Smartphone, { className: 'w-4 h-4 text-slate-400' })
                      : _createElement(Monitor, { className: 'w-4 h-4 text-slate-400' }),
                    _createElement('div', null,
                      _createElement('p', { className: 'text-sm font-medium' }, getPageName(pv.page)),
                      _createElement('p', { className: 'text-xs text-slate-400' }, pv.page)
                    )
                  ),
                  _createElement('span', { className: 'text-xs text-slate-500' }, 
                    new Date(pv.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
                  )
                );
              })
            )
          : _createElement('div', { className: 'text-center py-8' },
              _createElement('p', { className: 'text-slate-500' }, 'Carregue dados em tempo real para ver visitantes'),
              _createElement(Button, {
                size: 'sm',
                onClick: loadRealtime,
                className: 'mt-2 bg-emerald-600'
              }, 'Carregar Dados')
            )
      )
    )
  );

  // Render based on view
  var content;
  if (view === 'realtime') {
    content = realtimeView;
  } else if (view === 'pages') {
    content = pagesView;
  } else if (view === 'visitors') {
    content = visitorsView;
  } else {
    content = overviewView;
  }

  return _createElement('div', { className: 'space-y-6' },
    header,
    content
  );
}

export default AnalyticsDashboard;
