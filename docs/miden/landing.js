import * as React from "react";
import Link from "@docusaurus/Link";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import { firstRow } from "./features";

export function FirstRow({ title, status, description, linkUrl, imageUrl }) {
  return (
    <div className="col-md-4 p-8">
      <Link to={linkUrl} activeClassName="active">
        <div className="show-card">
          <div className="icon-wrapper">
            <img src={imageUrl} alt={title} className="icon" />
          </div>
          <div className="status">{status}</div>
          <div className="title">{title}</div>
          <div className="descriptions">{description}</div>
        </div>
      </Link>
    </div>
  );
};

export default function Welcome () {
  const context = useDocusaurusContext();
  return (
      <div className="bootstrap-wrapper">
        <br />
        <div className="container">
          <div className="row">
            <div className="index-page exclude">
            <section className="section container-fluid">
            <div className="row justify-content-center">
              <div className="col-lg-8">
                <h1 className="mt-0">
                  <a href="https://polygon.technology/polygon-miden" className="landing-page-link">
                    Miden
                  </a>{" "}
                  Wiki
                </h1>
                <h3 className="mt-0">Discover next-generation dApp development while harnessing the security of Ethereum.</h3>
              </div>
              <div className="col-lg-4 text-center pt-3 d-none d-lg-block" style={{ marginLeft: "-100px" }}>
                <div className="tabs_animation-wrapper supernets-video">
                  <iframe
                    src="https://player.vimeo.com/video/791153877?h=a0b62c3daa&badge=0&autopause=0&player_id=0&app_id=58479&loop=1&autoplay=1&background=1"
                    frameBorder="0"
                    allow="autoplay"
                    className="tabs-frame"
                    title="Hero"
                    data-ready="true"
                    width="800"
                    height="450"
                  />
                </div>
              </div>
            </div>
            </section>
            </div>
            <div className="row">
              {firstRow &&
                firstRow.length &&
                firstRow.map((props, idx) => (
                  <FirstRow key={idx} {...props} />
                ))}
            </div>
            <br />
            <br />
          </div>
        </div>
      </div>
  );
};
