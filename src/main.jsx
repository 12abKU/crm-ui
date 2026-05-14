import { createRoot } from 'react-dom/client'
import '@fontsource/manrope/400.css'
import '@fontsource/manrope/500.css'
import '@fontsource/manrope/600.css'
import '@fontsource/manrope/700.css'
import '@fontsource/manrope/800.css'
import './index.css'
import App from './App.jsx'
import SkeletonTheme from './components/skeletons/SkeletonTheme.jsx'
import { Provider } from 'react-redux'
import { store } from './store'

createRoot(document.getElementById('root')).render(
    <Provider store={store}>
        <SkeletonTheme>
            <App />
        </SkeletonTheme>
    </Provider>
)
