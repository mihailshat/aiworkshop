import Header from "./components/Header/Header"
import Footer from "./components/Footer/Footer"
import { AuthProvider } from "./contexts/AuthContext"
import { ArticleStorage } from './storage/ArticleStorage'
import { createContext, useState } from 'react'
import { ArticleStorageType } from './types/ArticleStorageType'
import { Outlet } from 'react-router-dom'
import "./App.css"

export const Context = createContext<ArticleStorageType | null>(null)

const App = (): JSX.Element => {
    const [currentArticleStorage] = useState<ArticleStorageType>({
        articleStorage: new ArticleStorage()
    });

    return (
        <AuthProvider>
            <Context.Provider value={currentArticleStorage}>
                <div className="app">
                    <Header />
                    <div className="content-wrapper">
                        <main className="main">
                            <Outlet />
                        </main>
                        <Footer />
                    </div>
                </div>
            </Context.Provider>
        </AuthProvider>
    )
}

export default App
