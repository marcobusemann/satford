import * as React from "react";
import { Layout, Menu, Breadcrumb } from "antd";
import { Tests } from "./components/Tests";
import { Test } from "./components/Test";
import { BrowserRouter as Router, Route, Link } from "react-router-dom";

const { Header, Content, Footer } = Layout;

export class App extends React.Component {
    render() {
        return (
            <Router>
                <Layout className="layout">
                    <Header>
                        <Link to="/" style={{ textDecoration: "none" }}>
                            <h1 style={{ color: "white" }}>SATFORD</h1>
                        </Link>
                        <Menu
                            theme="dark"
                            mode="horizontal"
                            defaultSelectedKeys={["2"]}
                            style={{ lineHeight: "64px" }}
                        />
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
