System.register(["pubsub-js"], function (exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var GlobalPubSub, PubSub;
    return {
        setters: [
            function (GlobalPubSub_1) {
                GlobalPubSub = GlobalPubSub_1;
            }
        ],
        execute: function () {
            PubSub = (function () {
                function PubSub() {
                }
                PubSub.prototype.publish = function (message, data) {
                    return GlobalPubSub.publish(message, data);
                };
                PubSub.prototype.subscribe = function (message, func) {
                    return GlobalPubSub.subscribe(message, func);
                };
                PubSub.TOPIC_TEST_COMPLETED = "test.completed";
                PubSub.TOPIC_TESTRESULT_CHANGED = "test.testresultchanged";
                return PubSub;
            }());
            exports_1("PubSub", PubSub);
        }
    };
});
