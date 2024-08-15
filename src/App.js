import React from 'react';
import {BrowserRouter, Route, Switch, Redirect } from 'react-router-dom';
import { ROUTES } from './routes'
import './scss/main.scss'
import Gallery from './pages/gallery'
import Activity from './pages/activity'
import Tokens from './pages/event'

import Footer from './components/footer'
import Header from './components/header'


function App() {

  document.body.className = 'poap-app'

  return (
    <BrowserRouter>
    <div className="landing">
      <Header />
      <Switch>
        <Redirect from={ROUTES.renderEvent} to={ROUTES.eventSlug} />
        <Route path={ROUTES.event}>
          <Tokens />
        </Route>
        <Route path={ROUTES.activity}>
          <Activity />
        </Route>
        <Route  path={ROUTES.home}>
          <Gallery />
        </Route>
      </Switch>
    <Footer />
    </div>
    </BrowserRouter>
  );
}


export default App;
