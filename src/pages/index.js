import * as React from "react";
import Layout from "@theme/Layout";
import Link from "@docusaurus/Link";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import useBaseUrl from "@docusaurus/useBaseUrl";
import { firstRow, thirdRow, networkBanner } from "../data/features";
import { Container, Row, Col } from 'react-bootstrap';

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

function FirstRow({ title, status, description, linkUrl, imageUrl }) {
  return (
    <div className="col-md-4 p-8">
      <Link to={useBaseUrl(linkUrl)} activeClassName="active">
        <div className="show-card">
          <div className="icon-wrapper">
            <img src={useBaseUrl(imageUrl)} alt={title} className="icon" />
          </div>
          <div className="status">{status}</div>
          <div className="title">{title}</div>
          <div className="descriptions">{description}</div>
        </div>
      </Link>
    </div>
  );
}

function Buttonizer({docsUrl, linkUrl}) {
  return (
    <div className="button-group">
      <a href={useBaseUrl(docsUrl)} target="_blank" className="button is-icon w-inline-flex">
        <div className="button-icon_left-element is-icon-medium">
          <div className="text-size-small">Start Learning</div>
        </div>
        <div className="button-icon_right-element is-icon-medium">
          <div className="icon-1x1-medium w-embed">
            <svg width="auto" height="auto" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M7 17L17 7M17 7V17M17 7H7" stroke="currentcolor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
            </svg>
          </div>
        </div>
      </a>
      <a href={useBaseUrl(linkUrl)} target="_blank" className="button is-icon is-secondary w-inline-flex">
        <div className="button-icon_left-element is-icon-medium">
          <div className="text-size-small">Start Building</div>
        </div>
        <div className="button-icon_right-element is-icon-medium">
          <div className="icon-1x1-medium w-embed">
            <svg width="auto" height="auto" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M7 17L17 7M17 7V17M17 7H7" stroke="currentcolor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
            </svg>
          </div>
        </div>
      </a>
    </div>
  );
}

function smoothScrollTo(target) {
  const element = document.querySelector(target);
  if (element) {
    window.scrollTo({
      behavior: 'smooth',
      top: element.offsetTop
    });
  }
}

function Home() {
  const context = useDocusaurusContext();
  const { siteConfig = {} } = context;

  return (
    <Layout>
      <div className="bootstrap-wrapper">
        <br />
        <div className="container">
          <div className="row">
          <div className="index-page exclude">
          <section className="section container-fluid">
            <div className="row justify-content-center">
              <div className="col-lg-8">
                <h1 className="mt-0"><a href="https://polygon.technology" class="landing-page-link">Polygon</a> Wiki</h1>
                <h3 className="mt-0"> The official documentation for <a href="https://polygon.technology" class="landing-page-link">0xPolygon</a></h3>
                <p className="lead">The <b>Polygon Wiki</b> is the source of truth for Polygon, providing comprehensive documentation, community resources, and guides for enthusiasts and developers interested in learning about or building on Polygon. <b>Stay tuned for the upcoming documentation experience for Polygon 2.0.</b></p>
                <a href="https://university.polygon.technology/" style={{ color: '#ffffff' }}>
                  <button className="btn btn-custom">Get started with Polygon</button>
                </a>
                <p><a href="#common-docs" onClick={(e) => { e.preventDefault(); smoothScrollTo('#common-docs'); }}><b>Start building ↓</b></a></p>
              </div>
              <div className="col-lg-4 text-center pt-3 d-none d-lg-block">
                <img style={{ maxWidth: '100%', maxHeight: '400px' }} src="img/polygon-logo.png" />
              </div>
            </div>
          </section>
          </div>
            <section id="common-docs" className="section container-fluid"></section>
            {firstRow &&
              firstRow.length &&
              firstRow.map((props, idx) => (
                <FirstRow key={idx} {...props} />
              ))}{" "}
          </div>

          <div className="row">
            <div className="index-page exclude">
              <section className="section container-fluid">
                <div className="row justify-content-center">
                  <div className="col-md-10">
                    <h3 className="mt-0">Mass Scale for Mass Adaption</h3>
                    <p className="lead">By leveraging cutting-edge technologies like ZK cryptography and transaction rollups, Polygon is making blockchains more accessible and user-friendly than ever.</p>
                    <p><a href="#polygon-protocol" onClick={(e) => { e.preventDefault(); smoothScrollTo('#polygon-protocols'); }}><b>Explore the Protocol Docs ↓</b></a></p>
                  </div>
                </div>
              </section>
            </div>
            <section id="polygon-protocols" className="row container-fluid justify-content-center">
            <Tabs className="tabs-lp" defaultValue="public" values={[
                {label: 'Public Chains', value: 'public'},
                {label: 'App Specific Chains', value: 'app-specific'},
                {label: 'Decentralized Identity', value: 'identity'},
              ]}>

            <TabItem value="public">
              <div class="tabs-element">
                <div class="tabs_animation-wrapper">
                  <div class="tabs_animation-embed pb_video_embed w-embed w-iframe">
                    <iframe src="https://player.vimeo.com/video/791153898?h=a0b62c3daa&amp;badge=0&amp;autopause=0&amp;player_id=0&amp;app_id=58479&amp;loop=1&amp;autoplay=1&amp;background=1" frameborder="0" allow="autoplay" class="tabs-frame" title="Hero" data-ready="true"></iframe>
                  </div>
                </div>
                <div class="tabs-content">
                  <h4 class="text-weight-medium">Polygon PoS <span class="solution-status">Live</span></h4>
                  <div class="padding-bottom padding-small"></div>
                  <p class="description-text">Support the most widely used Ethereum scaling ecosystem that offers EVM compatibility and an ultimate user experience with fast transactions at near-zero gas fees today.</p>
                  <div class="padding-bottom custom-padding"></div>
                  <Buttonizer docsUrl={'docs/pos'} linkUrl={'docs/category/deploy-a-contract'} />
                </div>
              </div>

              <div class="tabs-element reverse">
                <div class="tabs-content">
                  <h4 class="text-weight-medium">Polygon zkEVM <span class="solution-status">Mainnet Beta</span></h4>
                  <div class="padding-bottom padding-small"></div>
                  <p class="description-text">Unlock Ethereum scalability while maintaining security with the first ZK-rollup that offers EVM equivalence with fast transactions at near-zero gas cost today.</p>
                  <div class="padding-bottom custom-padding"></div>
                  <Buttonizer docsUrl={'https://zkevm.polygon.technology'} linkUrl={'https://zkevm.polygon.technology/docs/develop'} />
                </div>
                <div class="tabs_animation-wrapper">
                  <div class="tabs_animation-embed pb_video_embed w-embed w-iframe">
                    <iframe src="https://player.vimeo.com/video/791153931?h=a0b62c3daa&badge=0&autopause=0&player_id=0&app_id=58479&loop=1&autoplay=1&background=1" frameborder="0" allow="autoplay" class="tabs-frame" title="Hero" data-ready="true"></iframe>
                  </div>
                </div>
              </div>

              <div class="tabs-element">
                <div class="tabs_animation-wrapper">
                  <div class="tabs_animation-embed pb_video_embed w-embed w-iframe">
                    <iframe src="https://player.vimeo.com/video/791153877?h=a0b62c3daa&badge=0&autopause=0&player_id=0&app_id=58479&loop=1&autoplay=1&background=1" frameborder="0" allow="autoplay" class="tabs-frame" title="Hero" data-ready="true"></iframe>
                  </div>
                </div>
                <div class="tabs-content">
                  <h4 class="text-weight-medium">Polygon Miden <span class="solution-status">Coming Soon</span></h4>
                  <div class="padding-bottom padding-small"></div>
                  <p class="description-text">Build advanced dApps with client-side proving with the first decentralized rollup that leverages execution proofs of concurrent, local transactions.</p>
                  <div class="padding-bottom custom-padding"></div>
                  <Buttonizer docsUrl={'/docs/miden'} linkUrl={'/docs/miden/user_docs/usage'} />
                </div>
              </div>
            </TabItem>

            <TabItem value="app-specific">
              <div class="tabs-element">
                <div class="tabs_animation-wrapper">
                  <div class="tabs_animation-embed pb_video_embed w-embed w-iframe">
                    <iframe src="https://player.vimeo.com/video/791153912?h=a0b62c3daa&badge=0&autopause=0&player_id=0&app_id=58479&loop=1&autoplay=1&background=1" frameborder="0" allow="autoplay" class="tabs-frame" title="Hero" data-ready="true"></iframe>
                  </div>
                </div>
                <div class="tabs-content">
                  <h4 class="text-weight-medium">Polygon Supernets <span class="solution-status">Live</span></h4>
                  <div class="padding-bottom padding-small"></div>
                  <p class="description-text">Build app-chains powered by an industry-leading technology and ecosystem around Polygon.</p>
                  <div class="padding-bottom custom-padding"></div>
                  <Buttonizer docsUrl={'docs/supernets'} linkUrl={'docs/category/build-a-supernet'} />
                </div>
              </div>
            </TabItem>

            <TabItem value="identity">
              <div class="tabs-element">
                <div class="tabs_animation-wrapper">
                  <div class="tabs_animation-embed pb_video_embed w-embed w-iframe">
                    <iframe src="https://player.vimeo.com/video/791153864?h=a0b62c3daa&badge=0&autopause=0&player_id=0&app_id=58479&loop=1&autoplay=1&background=1" frameborder="0" allow="autoplay" class="tabs-frame" title="Hero" data-ready="true"></iframe>
                  </div>
                </div>
                <div class="tabs-content">
                  <h4 class="text-weight-medium">Polygon ID  <span class="solution-status">Live</span></h4>
                  <div class="padding-bottom padding-small"></div>
                  <p class="description-text">Build trusted and secure relationships between users and dApps, following the principles of self sovereign identity and privacy by default.</p>
                  <div class="padding-bottom custom-padding"></div>
                  <Buttonizer docsUrl={'https://0xpolygonid.github.io/tutorials/'} linkUrl={'https://0xpolygonid.github.io/tutorials/verifier/on-chain-verification/overview/'} />
                </div>
              </div>
            </TabItem>

          </Tabs>
          </section>
          </div>
          <br />
        </div>
      </div>
    </Layout>
  );
}

export default Home;
