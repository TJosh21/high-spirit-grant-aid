import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, DollarSign, Calendar, MapPin, Building2, Target, Clock, ExternalLink } from "lucide-react";
import { format } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Grant {
  id: string;
  name: string;
  sponsor_name: string;
  sponsor_type?: string;
  amount_min?: number;
  amount_max?: number;
  currency?: string;
  deadline?: string;
  short_description?: string;
  industry_tags?: string[];
  geography_tags?: string[];
  target_audience_tags?: string[];
  business_stage_tags?: string[];
  application_link?: string;
  slug: string;
}

interface GrantComparisonProps {
  grants: Grant[];
  onRemove: (grantId: string) => void;
  onClose: () => void;
}

export function GrantComparison({ grants, onRemove, onClose }: GrantComparisonProps) {
  if (grants.length === 0) return null;

  return (
    <Dialog open={grants.length > 0} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl">Compare Grants ({grants.length})</DialogTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>
        
        <ScrollArea className="h-[calc(90vh-100px)]">
          <div className="p-6">
            {/* Desktop: Side-by-side comparison */}
            <div className="hidden lg:grid lg:grid-cols-3 gap-6">
              {grants.map((grant) => (
                <Card key={grant.id} className="relative">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2 h-8 w-8 p-0"
                    onClick={() => onRemove(grant.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  
                  <CardHeader className="pb-3">
                    <div className="mb-2">
                      <Badge variant="outline">{grant.sponsor_type || 'Grant'}</Badge>
                    </div>
                    <CardTitle className="text-lg line-clamp-2">{grant.name}</CardTitle>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div>
                      <div className="text-xs font-medium text-muted-foreground mb-1">Sponsor</div>
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{grant.sponsor_name}</span>
                      </div>
                    </div>

                    <div>
                      <div className="text-xs font-medium text-muted-foreground mb-1">Funding Amount</div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-primary" />
                        <span className="text-sm font-semibold text-primary">
                          {grant.amount_min && grant.amount_max 
                            ? `${grant.currency || 'USD'} ${grant.amount_min.toLocaleString()} - ${grant.amount_max.toLocaleString()}`
                            : grant.amount_max 
                            ? `Up to ${grant.currency || 'USD'} ${grant.amount_max.toLocaleString()}`
                            : 'Amount not specified'}
                        </span>
                      </div>
                    </div>

                    {grant.deadline && (
                      <div>
                        <div className="text-xs font-medium text-muted-foreground mb-1">Deadline</div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-destructive" />
                          <span className="text-sm">{format(new Date(grant.deadline), 'MMM dd, yyyy')}</span>
                        </div>
                      </div>
                    )}

                    {grant.short_description && (
                      <div>
                        <div className="text-xs font-medium text-muted-foreground mb-1">Description</div>
                        <p className="text-sm text-muted-foreground line-clamp-3">{grant.short_description}</p>
                      </div>
                    )}

                    {grant.industry_tags && grant.industry_tags.length > 0 && (
                      <div>
                        <div className="text-xs font-medium text-muted-foreground mb-1">Industries</div>
                        <div className="flex flex-wrap gap-1">
                          {grant.industry_tags.slice(0, 3).map((tag, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {grant.industry_tags.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{grant.industry_tags.length - 3}
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}

                    {grant.geography_tags && grant.geography_tags.length > 0 && (
                      <div>
                        <div className="text-xs font-medium text-muted-foreground mb-1">Regions</div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{grant.geography_tags.join(', ')}</span>
                        </div>
                      </div>
                    )}

                    {grant.target_audience_tags && grant.target_audience_tags.length > 0 && (
                      <div>
                        <div className="text-xs font-medium text-muted-foreground mb-1">Target Audience</div>
                        <div className="flex items-center gap-2">
                          <Target className="h-4 w-4 text-muted-foreground" />
                          <div className="flex flex-wrap gap-1">
                            {grant.target_audience_tags.map((tag, i) => (
                              <Badge key={i} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    <Button asChild className="w-full mt-4">
                      <a href={`/grants/${grant.slug}`} target="_blank" rel="noopener noreferrer">
                        View Full Details
                        <ExternalLink className="ml-2 h-4 w-4" />
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Mobile: Stacked comparison */}
            <div className="lg:hidden space-y-4">
              {grants.map((grant) => (
                <Card key={grant.id} className="relative">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2 h-8 w-8 p-0 z-10"
                    onClick={() => onRemove(grant.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  
                  <CardHeader className="pb-3">
                    <div className="mb-2">
                      <Badge variant="outline">{grant.sponsor_type || 'Grant'}</Badge>
                    </div>
                    <CardTitle className="text-lg pr-8">{grant.name}</CardTitle>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-xs font-medium text-muted-foreground mb-1">Sponsor</div>
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{grant.sponsor_name}</span>
                        </div>
                      </div>

                      {grant.deadline && (
                        <div>
                          <div className="text-xs font-medium text-muted-foreground mb-1">Deadline</div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-destructive" />
                            <span className="text-sm">{format(new Date(grant.deadline), 'MMM dd, yyyy')}</span>
                          </div>
                        </div>
                      )}
                    </div>

                    <div>
                      <div className="text-xs font-medium text-muted-foreground mb-1">Funding Amount</div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-primary" />
                        <span className="text-sm font-semibold text-primary">
                          {grant.amount_min && grant.amount_max 
                            ? `${grant.currency || 'USD'} ${grant.amount_min.toLocaleString()} - ${grant.amount_max.toLocaleString()}`
                            : grant.amount_max 
                            ? `Up to ${grant.currency || 'USD'} ${grant.amount_max.toLocaleString()}`
                            : 'Amount not specified'}
                        </span>
                      </div>
                    </div>

                    {grant.industry_tags && grant.industry_tags.length > 0 && (
                      <div>
                        <div className="text-xs font-medium text-muted-foreground mb-1">Industries</div>
                        <div className="flex flex-wrap gap-1">
                          {grant.industry_tags.map((tag, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    <Button asChild className="w-full">
                      <a href={`/grants/${grant.slug}`}>
                        View Full Details
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
