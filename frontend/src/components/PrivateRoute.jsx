import { logout } from "@/redux/user/userSlice";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { isTokenExpired } from "@/lib/auth";
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogAction,
} from "@/components/ui/alert-dialog";

const PrivateRoute = () => {
    const { currentUser } = useSelector((state) => state.user);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [showExpiredDialog, setShowExpiredDialog] = useState(false);
    const token = localStorage.getItem("token");
    const location = useLocation();
    const tab = new URLSearchParams(location.search).get("tab");

    // Define valid tabs for each role
    const chairmanTabs = [
        "overview",
        "requestdocs",
        "incidents",
        "residents",
        "blotterreports",
        "transactions",
    ];
    const secretaryTabs = ["overview", "requestdocs", "incidents", "residents", "blotterreports"];
    const superAdminTabs = ["overview", "register", "allusers", "logs", "transactions"];
    const userTabs = ["overview", "requests", "reports", "blotter", "settings"];

    // Check if current tab is valid for user's role
    const isValidTab = () => {
        if (!tab) return true;

        switch (currentUser?.role) {
            case "superAdmin":
                return superAdminTabs.includes(tab);
            case "chairman":
                return chairmanTabs.includes(tab);
            case "secretary":
                return secretaryTabs.includes(tab);
            default:
                return userTabs.includes(tab);
        }
    };

    // Get default path based on role
    const getDefaultPath = () => {
        return "/dashboard?tab=overview";
    };

    const handleSessionExpired = () => {
        dispatch(logout());
        localStorage.removeItem("token");
        setShowExpiredDialog(false);
        navigate("/sign-in");
    };

    // Check for token expiration
    useEffect(() => {
        if (!currentUser) {
            navigate("/sign-in");
            return;
        }

        if (token && isTokenExpired(token)) {
            setShowExpiredDialog(true);
        }
    }, [currentUser, token, navigate]);

    // Redirect to appropriate dashboard if tab is invalid
    useEffect(() => {
        if (currentUser && tab && !isValidTab()) {
            navigate(getDefaultPath());
        }
    }, [currentUser, tab]);

    return (
        <>
            <AlertDialog open={showExpiredDialog} onOpenChange={setShowExpiredDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Session Expired</AlertDialogTitle>
                        <AlertDialogDescription>
                            Your session has expired. Please sign in again to continue.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogAction onClick={handleSessionExpired}>
                            Sign In Again
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {currentUser && !showExpiredDialog ? <Outlet /> : null}
        </>
    );
};

export default PrivateRoute;
