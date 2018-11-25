import * as React from "react";
import { RouteComponentProps } from "react-router-dom";
import * as socketIo from "socket.io-client";
import { ITestResult } from "../../shared/ITestResult";
import { Table, Breadcrumb } from "antd";
import { Link } from "react-router-dom";
import * as moment from "moment";
import { GitHubCalendar } from "./TestCalendar";

import "./TestCalendar.css";

interface IRouterProps {
    name: string;
}

interface IProps extends RouteComponentProps<IRouterProps> {}

interface IState {
    results: ITestResult[];
}

const panelColors = ["#EEEEEE", "#61ff69", "#ff6961"];

export class Test extends React.Component<IProps, IState> {
    private socket: SocketIOClient.Socket;

    constructor(props) {
        super(props);
        this.state = {
            results: []
        };
    }

    componentDidMount() {
        this.socket = socketIo();
        this.socket.on("HELLO", () => {
            console.log("Connected to server");
        });

        this.socket.on("TEST_FINISHED", (data: ITestResult) => {
            if (data.name === this.props.match.params.name) {
                const results = [data].concat(this.state.results);
                this.setState({ results });
            }
        });

        this.socket.on("RECEIVE_RESULTS_FOR_TEST", (data: ITestResult[]) => {
            this.setState({ results: data });
        });

        const testName = this.props.match.params.name;
        this.socket.emit("RESULTS_FOR_TEST", testName);
    }

    componentWillUnmount() {
        this.socket.disconnect();
        this.socket.close();
    }

    render() {
        const { results } = this.state;
        const testName = this.props.match.params.name;

        let chartData = {};
        results.forEach(result => {
            const date = moment(result.timestamp).format("YYYY-MM-DD");
            if (!chartData[date]) {
                const index = result.success ? 1 : 2;
                chartData[date] = index;
            }
        });

        return (
            <React.Fragment>
                <Breadcrumb style={{ margin: "16px 0" }}>
                    <Breadcrumb.Item>
                        <Link to="/">Tests</Link>
                    </Breadcrumb.Item>
                    <Breadcrumb.Item>{testName}</Breadcrumb.Item>
                </Breadcrumb>
                <div
                    style={{
                        background: "#fff",
                        padding: 24,
                        minHeight: 280
                    }}
                >
                    <h1 style={{ textAlign: "center" }}>{testName}</h1>
                    <div
                        style={{
                            marginLeft: "10em",
                            marginRight: "10em",
                            marginTop: "4em",
                            marginBottom: "4em"
                        }}
                    >
                        <GitHubCalendar
                            values={chartData}
                            until={moment().format("YYYY-MM-DD")}
                            panelColors={panelColors}
                        />
                    </div>
                    <Table
                        dataSource={results}
                        rowKey="timestamp"
                        rowClassName={result =>
                            result.success ? "success" : "failure"
                        }
                    >
                        <Table.Column
                            title="Timestamp"
                            key="timestamp"
                            dataIndex="timestamp"
                            render={timestamp =>
                                moment(timestamp).format("LLL")
                            }
                        />
                        <Table.Column
                            title="Data"
                            key="data"
                            dataIndex="data"
                            render={data => JSON.stringify(data)}
                        />
                    </Table>
                </div>
            </React.Fragment>
        );
    }
}
