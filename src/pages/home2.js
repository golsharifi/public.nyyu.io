import React from "react"
import { Link } from "gatsby"

import Seo from "../components/seo"
import { Hero1 } from "../utilities/imgImport"
import Header from "../components/header"

const IndexPage = () => (
    <>
        <Seo title="Home" />
        <main className="home-page">
            <Header />
            <section className="home-section">
                <div className="container h-100">
                    <div className="row mt-5 pt-5">
                        <div className="col-sm-7">
                            <h2 className="home-title">
                                <span className="txt-green">P</span>resale will start soon!
                            </h2>
                            <p className="home-text mt-5 pt-5">
                                <Link to="https://share.hsforms.com/1uASSxWOlQsWUX3inkpWpTQ4jiis" className="text-underline">
                                    SUBSCRIBE
                                </Link>{" "}
                                TO OUR WAITING LIST.
                            </p>
                        </div>
                        <div className="col-sm-5 d-flex justify-content-center align-items-center">
                            <img src={Hero1} alt="home hero" className="hero-image" />
                        </div>
                    </div>
                </div>
            </section>
        </main>
    </>
)

export default IndexPage
