import * as React from "react";
import { Layout, Menu } from "antd";
import { Tests } from "./components/Tests";
import { Test } from "./components/Test";
import { BrowserRouter as Router, Route, Link } from "react-router-dom";

const { Header, Content, Footer } = Layout;

export class App extends React.Component {
    render() {
        return (
            <Router>
                <Layout>
                    <Header>
                        <Link to="/" style={{ textDecoration: "none", float: "left" }}>
                            <span style={{ color: "white" }}>SATFORD</span>
                        </Link>
                        <Menu
                            theme="dark"
                            mode="horizontal"
                            selectable={false}
                            style={{ lineHeight: "64px" }}
                        >
                            <Menu.Item key="agenda" style={{ marginLeft: "2em" }}>
                                <a href="/agenda" target="_blank">
                                    Schedule tests
                                </a>
                            </Menu.Item>
                        </Menu>
                    </Header>
                    <Content style={{ padding: "0 50px" }}>
                        <Route exact path="/" component={Tests} />
                        <Route exact path="/test/:name" component={Test} />
                    </Content>
                    <Footer style={{ textAlign: "center" }}>
                        Satford 2018 Created by Marco Busemann
                    </Footer>
                </Layout>
            </Router>
        );
    }
}
