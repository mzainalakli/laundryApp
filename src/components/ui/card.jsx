const Card = ({ children }) => {
    return <div className="p-4 border rounded">{children}</div>;
};

const CardContent = ({ children }) => {
    return <div className="p-2">{children}</div>;
};

export { Card, CardContent };
