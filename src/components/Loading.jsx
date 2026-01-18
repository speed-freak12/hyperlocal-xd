const Loading = () => {
    return (
        <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="text-center">
                <div className="relative inline-block">
                    <span className="text-3xl font-bold bg-linear-to-r from-blue-400 to-blue-500 bg-clip-text text-transparent">
                        Hyperlocal
                    </span>
                </div>
            </div>
        </div>
    );
};

export default Loading;