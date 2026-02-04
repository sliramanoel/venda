import React, { useState, useEffect } from 'react';
import { Users, Eye, Monitor, Smartphone, RefreshCw, Activity, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { analyticsApi } from '../services/api';

function AnalyticsDashboard() {
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('7d');
  const [stats, setStats] = useState(null);
  const [realtime, setRealtime] = useState(null);
  const [view, setView] = useState('overview');

  useEffect(function() {
    loadStats();
  }, [period]);

  useEffect(function() {
    if (view === 'realtime') {
      loadRealtime();
      const interval = setInterval(loadRealtime, 10000);
      return function() { clearInterval(interval); };
    }
  }, [view]);

  function loadStats() {
    setLoading(true);
    analyticsApi.getOverview(period)
      .then(function(data) { setStats(data); })
      .catch(function(err) { console.error('Error:', err); })
      .finally(function() { setLoading(false); });
  }

  function loadRealtime() {
    analyticsApi.getRealtime()
      .then(function(data) { setRealtime(data); })
      .catch(function(err) { console.error('Error:', err); });
  }

  function fmt(n) { return (n || 0).toLocaleString('pt-BR'); }

  if (loading && !stats) {
    return React.createElement('div', { className: 'flex justify-center py-12' },
      React.createElement(RefreshCw, { className: 'w-8 h-8 animate-spin text-emerald-600' })
    );
  }

  var periodButtons = ['today', '7d', '30d', 'this_month'].map(function(p) {
    var label = p === 'today' ? 'Hoje' : p === '7d' ? '7 dias' : p === '30d' ? '30 dias' : 'Mês';
    return React.createElement(Button, {
      key: p,
      size: 'sm',
      variant: period === p ? 'default' : 'outline',
      onClick: function() { setPeriod(p); },
      className: period === p ? 'bg-emerald-600' : ''
    }, label);
  });

  var viewButtons = React.createElement('div', { className: 'flex flex-wrap gap-2' },
    React.createElement(Button, {
      size: 'sm',
      variant: view === 'overview' ? 'default' : 'outline',
      onClick: function() { setView('overview'); },
      className: view === 'overview' ? 'bg-emerald-600' : ''
    }, 'Visão Geral'),
    React.createElement(Button, {
      size: 'sm',
      variant: view === 'realtime' ? 'default' : 'outline',
      onClick: function() { setView('realtime'); },
      className: view === 'realtime' ? 'bg-emerald-600' : ''
    }, 
      React.createElement(Activity, { className: 'w-4 h-4 mr-1' }), 
      'Tempo Real'
    ),
    view === 'overview' ? React.createElement('span', { className: 'mx-2 text-slate-300' }, '|') : null,
    view === 'overview' ? periodButtons : null
  );

  var realtimeView = React.createElement('div', { className: 'space-y-4' },
    React.createElement(Card, { className: 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white border-0' },
      React.createElement(CardContent, { className: 'py-8' },
        React.createElement('div', { className: 'flex items-center justify-between' },
          React.createElement('div', null,
            React.createElement('p', { className: 'text-emerald-100' }, 'Usuários Online'),
            React.createElement('p', { className: 'text-5xl font-bold' }, (realtime && realtime.online_now) || 0)
          ),
          React.createElement(Zap, { className: 'w-12 h-12 opacity-50' })
        )
      )
    )
  );

  var overviewView = React.createElement('div', { className: 'grid grid-cols-2 md:grid-cols-4 gap-4' },
    React.createElement(Card, { className: 'border-0 shadow-lg' },
      React.createElement(CardContent, { className: 'pt-6' },
        React.createElement('div', { className: 'flex items-center gap-3' },
          React.createElement(Eye, { className: 'w-8 h-8 text-blue-500' }),
          React.createElement('div', null,
            React.createElement('p', { className: 'text-sm text-slate-500' }, 'Visualizações'),
            React.createElement('p', { className: 'text-2xl font-bold' }, fmt(stats && stats.total_pageviews))
          )
        )
      )
    ),
    React.createElement(Card, { className: 'border-0 shadow-lg' },
      React.createElement(CardContent, { className: 'pt-6' },
        React.createElement('div', { className: 'flex items-center gap-3' },
          React.createElement(Users, { className: 'w-8 h-8 text-emerald-500' }),
          React.createElement('div', null,
            React.createElement('p', { className: 'text-sm text-slate-500' }, 'Visitantes'),
            React.createElement('p', { className: 'text-2xl font-bold' }, fmt(stats && stats.unique_visitors))
          )
        )
      )
    ),
    React.createElement(Card, { className: 'border-0 shadow-lg' },
      React.createElement(CardContent, { className: 'pt-6' },
        React.createElement('div', { className: 'flex items-center gap-3' },
          React.createElement(Monitor, { className: 'w-8 h-8 text-purple-500' }),
          React.createElement('div', null,
            React.createElement('p', { className: 'text-sm text-slate-500' }, 'Sessões'),
            React.createElement('p', { className: 'text-2xl font-bold' }, fmt(stats && stats.total_sessions))
          )
        )
      )
    ),
    React.createElement(Card, { className: 'border-0 shadow-lg bg-emerald-600 text-white' },
      React.createElement(CardContent, { className: 'pt-6' },
        React.createElement('div', { className: 'flex items-center gap-3' },
          React.createElement(Zap, { className: 'w-8 h-8 text-emerald-200' }),
          React.createElement('div', null,
            React.createElement('p', { className: 'text-sm text-emerald-100' }, 'Online'),
            React.createElement('p', { className: 'text-2xl font-bold' }, fmt(stats && stats.online_now))
          )
        )
      )
    )
  );

  return React.createElement('div', { className: 'space-y-6' },
    viewButtons,
    view === 'realtime' ? realtimeView : overviewView
  );
}

export default AnalyticsDashboard;
