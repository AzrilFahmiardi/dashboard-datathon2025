import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Users } from "lucide-react"
import Link from "next/link"

export default function InfluencerLoginPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/login" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali
          </Link>

          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
              <Users className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold text-foreground">Influencer Login</span>
          </div>

          <h1 className="text-2xl font-bold text-foreground mb-2">Selamat Datang Kembali</h1>
          <p className="text-muted-foreground">Masuk ke dashboard influencer Anda</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Login Influencer</CardTitle>
            <CardDescription>Masukkan kredensial influencer Anda untuk mengakses dashboard</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="influencer@email.com" className="w-full" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" placeholder="••••••••" className="w-full" />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <input type="checkbox" id="remember" className="rounded" />
                <Label htmlFor="remember" className="text-sm">
                  Ingat saya
                </Label>
              </div>
              <Link href="#" className="text-sm text-primary hover:underline">
                Lupa password?
              </Link>
            </div>

            <Button className="w-full" size="lg">
              Masuk ke Dashboard
            </Button>

            <Separator />

            <div className="text-center">
              <p className="text-muted-foreground text-sm">
                Belum punya akun influencer?{" "}
                <Link href="/register/influencer" className="text-primary hover:underline font-medium">
                  Daftar sekarang
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
