import Link from "next/link";
import Head from "next/head";

import { withNamespaces } from "../i18n";

function Page() {
  return (
    <div>
      <Head>
        <title>
          Math Project - Experiments with React, Mathbox and Next.js
        </title>
      </Head>
      <h3>List of experiments with Mathbox, React and Next.js</h3>
      <ul>
        <li>
          <Link href="/settings">
            <a>Function settings</a>
          </Link>{" "}
          - dynamic visualization with interactive settings panel
        </li>
        <li>
          <Link href="/set-expression">
            <a>Settable function expression</a>
          </Link>{" "}
          - explore and play with various functions
        </li>
        <li>
          <Link href="/multiple-expressions">
            <a>Multiple functions in one visualization</a>
          </Link>{" "}
          - change settings of each of the functions
        </li>
      </ul>
    </div>
  );
}

Page.getInitialProps = async () => {
  return {
    namespacesRequired: ["common"]
  };
};

export default withNamespaces("common")(Page);
