import { GameService } from './services/GameService';
import './styles/reset.css';
import './styles/game.css';
import Alpine from 'alpinejs';
import UIStore from './stores/UIStore';


window.Alpine = Alpine;
Alpine.store('ui', UIStore);
Alpine.start();

GameService.instance.setup();