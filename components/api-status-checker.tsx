"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, CheckCircle, RefreshCw, Activity } from 'lucide-react'
import { influencerAPI, type DataStatusResponse } from '@/lib/influencer-api'

export function APIStatusChecker() {
  const [apiStatus, setApiStatus] = useState<'loading' | 'connected' | 'error' | 'idle'>('idle')
  const [dataStatus, setDataStatus] = useState<DataStatusResponse | null>(null)
  const [error, setError] = useState<string>('')
  const [lastChecked, setLastChecked] = useState<Date | null>(null)

  const checkAPIStatus = async () => {
    setApiStatus('loading')
    setError('')

    try {
      // Check health
      const healthResponse = await influencerAPI.healthCheck()
      console.log('Health check:', healthResponse)

      // Get data status
      const dataResponse = await influencerAPI.getDataStatus()
      console.log('Data status:', dataResponse)

      if (dataResponse) {
        setDataStatus(dataResponse)
        setApiStatus('connected')
        setLastChecked(new Date())
      } else {
        throw new Error('No data received from API')
      }
    } catch (err: any) {
      console.error('API Status Check Error:', err)
      setError(err.message || 'Failed to connect to API')
      setApiStatus('error')
      setDataStatus(null)
    }
  }

  useEffect(() => {
    checkAPIStatus()
  }, [])

  const getStatusColor = () => {
    switch (apiStatus) {
      case 'connected': return 'text-green-600'
      case 'error': return 'text-red-600'
      case 'loading': return 'text-yellow-600'
      default: return 'text-gray-600'
    }
  }

  const getStatusIcon = () => {
    switch (apiStatus) {
      case 'connected': return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'error': return <AlertCircle className="w-4 h-4 text-red-600" />
      case 'loading': return <RefreshCw className="w-4 h-4 text-yellow-600 animate-spin" />
      default: return <Activity className="w-4 h-4 text-gray-600" />
    }
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              {getStatusIcon()}
              API Connection Status
            </CardTitle>
            <CardDescription>
              Connection status to Influencer Recommendation API
            </CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={checkAPIStatus}
            disabled={apiStatus === 'loading'}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${apiStatus === 'loading' ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Connection Status:</span>
            <Badge variant={apiStatus === 'connected' ? 'default' : apiStatus === 'error' ? 'destructive' : 'secondary'}>
              {apiStatus === 'connected' ? 'Connected' : 
               apiStatus === 'error' ? 'Disconnected' :
               apiStatus === 'loading' ? 'Checking...' : 'Unknown'}
            </Badge>
          </div>

          {lastChecked && (
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Last Checked:</span>
              <span className="text-sm text-muted-foreground">
                {lastChecked.toLocaleString()}
              </span>
            </div>
          )}

          {dataStatus && (
            <div className="mt-4 p-3 bg-muted rounded-lg">
              <h4 className="font-medium mb-2">Data Status</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Total Influencers:</span>
                  <span className="font-medium">
                    {dataStatus.data_shapes && dataStatus.data_shapes.instagram_influencers
                      ? dataStatus.data_shapes.instagram_influencers[0]
                      : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>All Data Loaded:</span>
                  <Badge variant={dataStatus.all_data_loaded ? 'default' : 'destructive'}>
                    {dataStatus.all_data_loaded ? 'Yes' : 'No'}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>Last Updated:</span>
                  <span className="font-medium">{dataStatus.timestamp ?? 'N/A'}</span>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600" />
                <span className="text-sm font-medium text-red-800">Error</span>
              </div>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          )}

          <div className="text-xs text-muted-foreground">
            API Base URL: {process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
