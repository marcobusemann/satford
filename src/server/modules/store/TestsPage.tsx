import * as React from 'react';
import * as moment from 'moment';
import * as _ from 'lodash';

class BasicPage extends React.Component {

    render(): JSX.Element {
        return (
            <html>
                <head>
                    <title>Satford - Tests overview</title>
                    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0-beta.2/css/bootstrap.min.css" integrity="sha384-PsH8R72JQ3SOdhVi3uxftmaW6Vc51MKb0q5P2rRUpPvrszuE4W1povHYgTpBfshb" crossOrigin="anonymous"/>
                </head>
                <body>
                    {this.props.children}
                </body>
            </html>
        );
    }
}

interface IProps {
    tests: ITest[];
    results: ITestResult[];
}

interface ITestWithResults extends ITest {
    results: ITestResult[];
}

export class TestsPage extends React.Component<IProps> {
    constructor(props, context) {
        super(props, context);
    }

    render() {
        const { tests, results } = this.props;

        const testsWithResults = tests.map((test) => {
            return Object.assign({}, test, {
                results: _.take(results.filter((result) => {
                    return result.testName === test.name;
                }).sort((a, b) => a.timestamp > b.timestamp ? -1 : a.timestamp < b.timestamp ? 1 : 0), 10);
            });
        });

        const buildTestResultRow = (result: ITestResult) => {
            return (
                <tr key={result.timestamp + ''} style={{ backgroundColor: result.success ? 'green' : 'red' }}>
                    <td>{result.success ? 'Yes' : 'No' }</td>
                    <td>{moment(result.timestamp).format('LLLL')}</td>
                    <td>{JSON.stringify(result.data)}</td>
                </tr>
            );
        };

        const testsWithResultsVisual = testsWithResults.map((test) => {
            return (
                <div>
                    <div key={test.name} className="card">
                        <h3 className="card-header"><a id={test.name}>{ test.name }</a></h3>
                        <div className="card-body">
                            <b>Active</b>: { test.isActive ? 'Yes' : 'No' }<br />
                            <b>Type</b>: { test.type }<br />
                            <b>Endpoint</b>: { test.endpoint }<br />
                            <b>Frequence</b>: { test.frequency }<br />
                            <b>Expects</b>: { JSON.stringify(test.expects) }
                            <br /><br />
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th scope="col">Success</th>
                                        <th scope="col">Timestamp</th>
                                        <th scope="col">Data</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    { test.results.map(buildTestResultRow) }
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <br />
                </div>
            );
        });

        const testsForOverview = testsWithResults.map((test: ITestWithResults) => {
            return (
                <li style={{ color: test.results && test.results.length > 0 ? (test.results[0].success ? 'green' : 'red') : 'black' }}>
                    <a href={'#' + test.name}>
                        { test.name }
                    </a>
                </li>
            );
        });

        return (
            <BasicPage>
                <div className='container'>
                    <h1>Overview</h1>
                    <ul>
                        { testsForOverview }
                    </ul>
                    <h1>Tests</h1>
                    { testsWithResultsVisual }
                </div>
            </BasicPage>
        );
    }
}

import { renderToString } from 'react-dom/server';
import { ITest, ITestResult } from '../domain/ITest';

export const TestPageHtml = (tests: ITest[], testResults: ITestResult[]) => {
    const page = new TestsPage({
        tests,
        results: testResults
    }, {});
    return renderToString(page.render());
}