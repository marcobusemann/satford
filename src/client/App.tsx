import * as React from "react";
import { Layout, Menu, Breadcrumb } from "antd";
import { Tests } from "./components/Tests";

const { Header, Content, Footer } = Layout;

export class App extends React.Component {
    render() {
        return (
            <Layout className="layout">
                <Header>
                    <div className="logo" />
                    <Menu
                        theme="dark"
                        mode="horizontal"
                        defaultSelectedKeys={["2"]}
                        style={{ lineHeight: "64px" }}
                    />
                </Header>
                <Content style={{ padding: "0 50px" }}>
                    <Breadcrumb style={{ margin: "16px 0" }}>
                        <Breadcrumb.Item>Tests</Breadcrumb.Item>
                    </Breadcrumb>
                    <div
                        style={{
                            background: "#fff",
                            padding: 24,
                            minHeight: 280
                        }}
                    >
                        <Tests />
                    </div>
                </Content>
                <Footer style={{ textAlign: "center" }}>
                    Ant Design ©2018 Created by Ant UED
                </Footer>
            </Layout>
        );
    }
}
