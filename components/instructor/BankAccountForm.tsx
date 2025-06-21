"use client";

import { useState, useEffect } from "react";
import { usePayment } from "@/context/PaymentProvider";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Loader } from "lucide-react";

// Form schema
const formSchema = z.object({
  businessName: z.string().min(3, {
    message: "Business name must be at least 3 characters.",
  }),
  bankCode: z.string().min(1, {
    message: "Please select a bank.",
  }),
  accountNumber: z.string().min(6, {
    message: "Please enter a valid account number.",
  }),
  percentageCharge: z.number().min(0).max(100),
});

export function BankAccountForm() {
  const {
    subaccount,
    loading,
    createSubaccount,
    updateSubaccount,
    hasSubaccount,
  } = usePayment();
  const { toast } = useToast();
  const [banks, setBanks] = useState<{ code: string; name: string }[]>([]);
  const [isLoadingBanks, setIsLoadingBanks] = useState(false);

  // Initialize form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      businessName: subaccount?.businessName || "",
      bankCode: subaccount?.bankCode || "",
      accountNumber: subaccount?.accountNumber || "",
      percentageCharge: 100 - (subaccount?.percentageCharge || 30),
    },
  });

  // Fetch Kenyan banks
  useEffect(() => {
    const fetchBanks = async () => {
      setIsLoadingBanks(true);
      try {
        const response = await fetch("/api/instructors/get-banks");
        const data = await response.json();
        if (data.status) {
          setBanks(data.data);
        }
      } catch (error) {
        console.error("Error fetching banks:", error);
        toast({
          title: "Error",
          description: "Failed to load bank list. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoadingBanks(false);
      }
    };

    fetchBanks();
  }, [toast]);

  // Update form when subaccount data changes
  useEffect(() => {
    if (subaccount) {
      form.reset({
        businessName: subaccount.businessName,
        bankCode: subaccount.bankCode,
        accountNumber: subaccount.accountNumber,
        percentageCharge: 100 - subaccount.percentageCharge,
      });
    }
  }, [subaccount, form]);

  // Form submission
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      // Invert percentage (platform gets values.percentageCharge, instructor gets 100-value)
      const platformPercentage = 100 - values.percentageCharge;

      const data = {
        businessName: values.businessName,
        bankCode: values.bankCode,
        accountNumber: values.accountNumber,
        percentageCharge: platformPercentage,
      };

      if (hasSubaccount) {
        await updateSubaccount(data);
      } else {
        await createSubaccount(data);
      }

      toast({
        title: hasSubaccount ? "Account Updated" : "Account Created",
        description: "Your payment details have been saved successfully.",
      });
    } catch (error) {
      console.error("Error saving bank account:", error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bank Account Details</CardTitle>
        <CardDescription>
          Set up your bank account to receive payments in Kenyan Shillings
          (KES). You will receive {form.watch("percentageCharge")}% of each
          payment.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="businessName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Business Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Your business name" {...field} />
                  </FormControl>
                  <FormDescription>
                    This name will appear on your students' bank statements.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="bankCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bank</FormLabel>
                  <Select
                    disabled={isLoadingBanks}
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your bank" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {isLoadingBanks ? (
                        <div className="flex items-center justify-center p-4">
                          <Loader className="w-4 h-4 mr-2 animate-spin" />
                          Loading banks...
                        </div>
                      ) : (
                        banks.map((bank) => (
                          <SelectItem key={bank.code} value={bank.code}>
                            {bank.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="accountNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Account Number</FormLabel>
                  <FormControl>
                    <Input placeholder="Account number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="percentageCharge"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Percentage ({field.value}%)</FormLabel>
                  <FormControl>
                    <Slider
                      min={50}
                      max={95}
                      step={1}
                      defaultValue={[field.value]}
                      onValueChange={(vals) => field.onChange(vals[0])}
                    />
                  </FormControl>
                  <FormDescription>
                    Platform fee: {100 - field.value}% | Your share:{" "}
                    {field.value}%
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={loading} className="w-full">
              {loading && <Loader className="w-4 h-4 mr-2 animate-spin" />}
              {hasSubaccount
                ? "Update Account Details"
                : "Save Account Details"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
