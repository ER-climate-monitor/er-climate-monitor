type Query = { value: number; name: string };

type Alert = {
    sensorName: string;
    type: string;
    value: number;
    unit: string;
    timestamp: number;
    query: Query;
};

type AlertEvent = {
    eventKey: string;
    alert: Alert;
};

function buildEvent(alert: Alert): AlertEvent {
    return {
        eventKey: `${alert.type}.${alert.sensorName}.${alert.query.name}`,
        alert,
    };
}

export { Alert, AlertEvent, buildEvent };
