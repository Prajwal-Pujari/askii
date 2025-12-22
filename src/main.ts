import { Router } from './router/Router';
import { LandingPage } from './pages/Landing';
import { StudioPage } from './pages/Studio';
import { GalleryPage } from './pages/Gallery';
import { AboutPage } from './pages/About';
import './styles/variables.css';
import './styles/components.css';

const router = new Router();

// Register routes
router.register('/', LandingPage);
router.register('/studio', StudioPage);
router.register('/gallery', GalleryPage);
router.register('/about', AboutPage);

// Start router
router.init();