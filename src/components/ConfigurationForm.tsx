"use client";

import * as React from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Settings, PlusCircle, Trash2, Youtube } from "lucide-react";

import { Button } from "@/components/ui/button";
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import useLocalStorage from '@/hooks/useLocalStorage';
import type { Channel } from '@/types';
import { getChannelDetails } from '@/lib/youtube'; // Import the function

const formSchema = z.object({
  apiKey: z.string().min(1, "API Key is required."),
  newChannelId: z.string().optional(), // Temporary field for adding new channels
});

interface ConfigurationFormProps {
  onConfigChange: (apiKey: string, channels: Channel[]) => void;
  initialApiKey: string;
  initialChannels: Channel[];
}

export function ConfigurationForm({ onConfigChange, initialApiKey, initialChannels }: ConfigurationFormProps) {
  const { toast } = useToast();
  const [channels, setChannels] = useLocalStorage<Channel[]>('youtubeChannels', initialChannels);
  const [apiKey, setApiKey] = useLocalStorage<string>('youtubeApiKey', initialApiKey);
  const [isLoadingChannel, setIsLoadingChannel] = React.useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      apiKey: apiKey,
      newChannelId: "",
    },
    // Update default value if apiKey changes externally (e.g., via localStorage sync)
    values: {
        apiKey: apiKey,
        newChannelId: "",
    }
  });

  async function handleAddChannel() {
    const newChannelId = form.getValues("newChannelId")?.trim();
    if (!newChannelId) {
      form.setError("newChannelId", { type: "manual", message: "Channel ID cannot be empty." });
      return;
    }
    if (channels.some(ch => ch.id === newChannelId)) {
      form.setError("newChannelId", { type: "manual", message: "Channel already added." });
      return;
    }

    setIsLoadingChannel(true);
    form.clearErrors("newChannelId");

    // Fetch channel details to get the name
    const channelDetails = await getChannelDetails(newChannelId, apiKey);
    setIsLoadingChannel(false);

    if (!channelDetails) {
        toast({
            variant: "destructive",
            title: "Error adding channel",
            description: `Could not find channel with ID: ${newChannelId}. Please check the ID and API Key.`,
        });
        form.setError("newChannelId", { type: "manual", message: "Invalid Channel ID or API Key issue." });
        return;
    }


    const newChannel: Channel = { id: newChannelId, name: channelDetails.name };
    const updatedChannels = [...channels, newChannel];
    setChannels(updatedChannels);
    onConfigChange(apiKey, updatedChannels); // Notify parent
    form.setValue("newChannelId", ""); // Clear input field
    toast({
      title: "Channel Added",
      description: `${channelDetails.name || newChannelId} has been added successfully.`,
    });
  }

  function handleRemoveChannel(idToRemove: string) {
    const updatedChannels = channels.filter((ch) => ch.id !== idToRemove);
    setChannels(updatedChannels);
     onConfigChange(apiKey, updatedChannels); // Notify parent
    toast({
      title: "Channel Removed",
      description: `Channel has been removed.`,
    });
  }

  function onSubmit(values: z.infer<typeof formSchema>) {
     const currentApiKey = values.apiKey.trim();
     if (currentApiKey !== apiKey) {
        setApiKey(currentApiKey);
        onConfigChange(currentApiKey, channels); // Notify parent immediately
     }
    toast({
      title: "Configuration Saved",
      description: "API Key has been updated.",
    });
  }

   // Effect to sync form's apiKey if it changes in localStorage
  React.useEffect(() => {
    form.setValue('apiKey', apiKey);
  }, [apiKey, form]);

  return (
    <Card className="w-full max-w-lg mx-auto shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="w-6 h-6 text-primary" />
          Configuration
        </CardTitle>
        <CardDescription>Enter your YouTube API Key and manage channel IDs.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="apiKey"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>YouTube API Key</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="Enter your API Key" {...field} />
                  </FormControl>
                  <FormDescription>
                    Your key is stored locally and used to check for new videos.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

             {/* Button to save API Key */}
             <Button type="submit" className="w-full">Save API Key</Button>

             <div className="space-y-4 pt-4">
                 <h3 className="text-lg font-medium flex items-center gap-2"><Youtube className="w-5 h-5 text-primary"/> Channels to Monitor</h3>
                 {channels.length === 0 && (
                    <p className="text-sm text-muted-foreground">No channels added yet.</p>
                 )}
                 <ul className="space-y-2">
                    {channels.map((channel) => (
                        <li key={channel.id} className="flex items-center justify-between p-2 border rounded-md bg-secondary/30">
                            <div className="flex flex-col">
                               <span className="font-medium text-sm">{channel.name || 'Loading name...'}</span>
                               <span className="text-xs text-muted-foreground">{channel.id}</span>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                type="button"
                                onClick={() => handleRemoveChannel(channel.id)}
                                aria-label={`Remove channel ${channel.name || channel.id}`}
                            >
                                <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                        </li>
                    ))}
                 </ul>

                 <FormField
                    control={form.control}
                    name="newChannelId"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Add New Channel ID</FormLabel>
                        <div className="flex gap-2">
                            <FormControl>
                            <Input placeholder="UC..." {...field} />
                            </FormControl>
                            <Button
                                type="button"
                                onClick={handleAddChannel}
                                disabled={isLoadingChannel}
                                variant="outline"
                                size="icon"
                                aria-label="Add Channel"
                            >
                               {isLoadingChannel ? (
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                                ) : (
                                     <PlusCircle className="w-5 h-5 text-accent" />
                                )}

                            </Button>
                        </div>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
             </div>


          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
