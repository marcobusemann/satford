import * as React from "react";
import { List, Tag } from "antd";
import * as socketIo from "socket.io-client";
import { ITest, ITestsAndLastResults } from "../../shared/ITest";
import { ITestResult } from "../../shared/ITestResult";

interface IState {
    tests: ITest[];
    results: { [index: string]: ITestResult };
}

export class Tests extends React.Component<any, IState> {
    private socket: SocketIOClient.Socket;

    constructor(props) {
        super(props);
        this.state = {
            tests: [],
            results: {}
        };
    }

    componentDidMount() {
        this.socket = socketIo();
        this.socket.on("HELLO", () => {
            console.log("Connected to server");
        });

        this.socket.on("TESTS", (data: ITestsAndLastResults) => {
            this.setState({ tests: data.tests, results: data.results });
        });

        this.socket.on("TEST_FINISHED", (data: ITestResult) => {
            const results = Object.assign({}, this.state.results);
            results[data.name] = data;
            this.setState({ results });
        });
    }

    render() {
        const { tests } = this.state;

        return (
            <React.Fragment>
                <h1>Tests</h1>
                <List
                    bordered
                    dataSource={tests}
                    renderItem={test => this.renderTest(test)}
                />
            </React.Fragment>
        );
    }

    renderTest = (test: ITest) => {
        const tags = [];

        const result = this.state.results[test.name];
        if (result) {
            if (result.success)
                tags.push(
                    <Tag key="succes" color="green">
                        success
                    </Tag>
                );
            else
                tags.push(
                    <Tag key="succes" color="red">
                        failed
                    </Tag>
                );
        }

        if (test.isActive)
            tags.push(
                <Tag key="active" color="green">
                    active
                </Tag>
            );
        else
            tags.push(
                <Tag key="active" color="yellow">
                    inactive
                </Tag>
            );

        tags.push(<Tag key="type">{test.type}</Tag>);
        tags.push(<Tag key="frequency">{test.frequency}</Tag>);

        return (
            <List.Item key={test.name}>
                <List.Item.Meta title={test.name} />
                <div>{tags}</div>
            </List.Item>
        );
    };
}
