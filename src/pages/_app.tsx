import { type AppType } from "next/dist/shared/lib/utils";
import Head from "next/head";
import { ToastProvider } from "~/context/toast";
import "nprogress/nprogress.css";
import "~/styles/globals.css";

import { useEffect } from "react";
import Router from "next/router";
import NProgress from "nprogress";

const MyApp: AppType = ({ Component, pageProps }) => {
  useEffect(() => {
    const start = () => NProgress.start();
    const done = () => NProgress.done();

    Router.events.on("routeChangeStart", start);
    Router.events.on("routeChangeComplete", done);
    Router.events.on("routeChangeError", done);

    return () => {
      Router.events.off("routeChangeStart", start);
      Router.events.off("routeChangeComplete", done);
      Router.events.off("routeChangeError", done);
    };
  }, []);

  return (
    <>
      <Head>
        <title>Nihongo</title>
        <meta name="description" content="Duolingo nhom 17" />
        <link rel="icon" href="/favicon.ico" />
        <meta name="theme-color" content="#0A0" />
        <link rel="manifest" href="/app.webmanifest" />
      </Head>
      <ToastProvider>
        <Component {...pageProps} />
      </ToastProvider>
    </>
  );
};

export default MyApp;
