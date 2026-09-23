const Navbar = () => {
    return (
        <nav className="flex items-center justify-between p-4 bg-card border-b border-border">
            <div className="flex items-center space-x-2">
                <h1 className="text-xl font-bold text-primary">Sadqah Application</h1>
            </div>
            <div className="flex items-center space-x-4">
                <a href="/login" className="text-foreground hover:text-primary transition-colors">
                    Login
                </a>
                {/* <a href="/signup" className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:opacity-90 transition-opacity">
                    Sign Up
                </a> */}
            </div>
        </nav>
    );
}
export default Navbar;