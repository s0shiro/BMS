// Third-party libraries
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";

// Components and UI elements
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";

// Utilities
import { cn } from "@/lib/utils";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

const schema = z.object({
    name: z.string().min(2, {
        message: "Name must be at least 2 characters.",
    }),
    contactNumber: z.string().min(10, {
        message: "Contact number must be at least 10 characters.",
    }),
    dateOfBirth: z.string(),
    barangay: z.string().min(2, {
        message: "Address must be at least 2 characters.",
    }),
    email: z.string().email("Invalid email address."),
    password: z.string().min(8, {
        message: "Password must be at least 8 characters.",
    }),
    confirmPassword: z.string(),
});

export function SignupForm({ className }) {
    const [loading, setLoading] = useState(false);
    const [barangays, setBarangays] = useState([]);
    const navigate = useNavigate();


    const allowedBarangays = [
        'Antipolo',
        'Bahi',
        'Bangbang',
        'Banuyo',
        'Cabugao',
        'Dawis',
        'Dili',
        'Libtangin',
        'Mangiliol',
        'Masiga',
        'Pangi',
        'Tapuyan'
    ];

    const fetchBarangays = async () => {
        try {
            const res = await axios.get(import.meta.env.VITE_GASAN_BARANGAYS_API_URL);
            // Filter and sort the barangays
            const filteredBarangays = res.data
                .filter(barangay => allowedBarangays.includes(barangay.name))
                .sort((a, b) => a.name.localeCompare(b.name));
            setBarangays(filteredBarangays);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchBarangays();
    }, []);

    const form = useForm({
        resolver: zodResolver(schema),
        defaultValues: {
            name: "",
            contactNumber: "",
            dateOfBirth: "",
            barangay: "",
            email: "",
            password: "",
            confirmPassword: "",

        },
    });

    const handleRegister = async (values) => {
        try {
            const { name, contactNumber, dateOfBirth, barangay, email, password, confirmPassword } = values;

            if (password !== confirmPassword) {
                toast.error("Passwords do not match.");
                return;
            }

            if (!name || !email || !barangay || !password || !confirmPassword) {
                toast.error("All fields are required.");
                return;
            }

            setLoading(true);

            const res = await axios.post(`http://localhost:5000/api/auth/signup`, {
                name,
                contactNumber,
                dateOfBirth,
                barangay,
                email,
                password,

            });


            if (res.status === 201) {
                setLoading(false);
                navigate("/sign-in");
                toast.success("Account created successfully.", {
                    description: "Please verify your email to login.",
                });
            }
        } catch (error) {
            console.error(error);
            if (error.response && error.response.status === 400) {
                setLoading(false);
                toast.error("Email is already taken", {
                    description: "Please try another email.",
                });
            } else if (error.response && error.response.status === 401) {
                setLoading(false);
                toast.error("Name is already taken", {
                    description: "Please try another name.",
                });
            }
            setLoading(false);
        }
    };

    return (
        <Form {...form}>
            <form
                className={cn("space-y-6", className)}
                onSubmit={form.handleSubmit(handleRegister)}
            >
                <div className="space-y-4 text-center">
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                        Create your account
                    </h1>
                    <p className="text-sm text-gray-600">Fill in your details to get started</p>
                </div>

                <div className="space-y-4">
                    {/* Name and Contact Number side by side */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-sm font-medium text-gray-700">
                                        Full Name
                                    </FormLabel>
                                    <FormControl>
                                        <Input {...field} placeholder="John Doe" className="h-11" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="contactNumber"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-sm font-medium text-gray-700">
                                        Contact Number
                                    </FormLabel>
                                    <FormControl>
                                        <Input {...field} placeholder="09123456789" className="h-11" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    {/* Date of Birth - Full width */}
                    <FormField
                        control={form.control}
                        name="dateOfBirth"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-sm font-medium text-gray-700">Date of Birth</FormLabel>
                                <FormControl>
                                    <Input
                                        type="date"
                                        {...field}
                                        className="h-11"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Barangay - Full width */}
                    <FormField
                        control={form.control}
                        name="barangay"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-sm font-medium text-gray-700">
                                    Barangay
                                </FormLabel>
                                <Select value={field.value} onValueChange={field.onChange}>
                                    <FormControl>
                                        <SelectTrigger className="h-11">
                                            <SelectValue placeholder="Select barangay" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {barangays.map((barangay) => (
                                            <SelectItem key={barangay.code} value={barangay.name}>
                                                {barangay.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Email */}
                    <div className="grid grid-cols-1 gap-4">
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-sm font-medium text-gray-700">
                                        Email
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            placeholder="m@example.com"
                                            className="h-11"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    {/* Password Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-sm font-medium text-gray-700">
                                        Password
                                    </FormLabel>
                                    <FormControl>
                                        <Input {...field} type="password" className="h-11" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="confirmPassword"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-sm font-medium text-gray-700">
                                        Confirm Password
                                    </FormLabel>
                                    <FormControl>
                                        <Input {...field} type="password" className="h-11" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </div>

                <Button
                    type="submit"
                    className="w-full h-11 bg-green-600 hover:bg-green-700 text-white"
                    disabled={loading}
                >
                    {loading ? (
                        <div className="flex items-center gap-2">
                            <span className="animate-spin">⏳</span> Creating account...
                        </div>
                    ) : (
                        "Create account"
                    )}
                </Button>

                <div className="text-center text-sm text-gray-600">
                    Already have an account?{" "}
                    <Link to="/sign-in" className="font-medium text-green-600 hover:text-green-500">
                        Sign in
                    </Link>
                </div>
            </form>
        </Form>
    );
}

SignupForm.propTypes = {
    className: PropTypes.string,
};
