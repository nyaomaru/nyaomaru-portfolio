import { createRoutesFromElements, Route } from '@remix-run/react';
import TopRoute from './routes/_index';
import ProfileRouteProfile from './routes/profile';
import ArticlesRoute from './routes/articles';

export const routes = createRoutesFromElements(
  <Route>
    <Route path='/' element={<TopRoute />} />
    <Route path='/profile' element={<ProfileRouteProfile />} />
    <Route path='/articles' element={<ArticlesRoute />} />
  </Route>,
);
