import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Users } from "lucide-react"
import Link from "next/link"

export default function InfluencerRegisterPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/register" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali
          </Link>

          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
              <Users className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold text-foreground">Influencer Register</span>
          </div>

          <h1 className="text-2xl font-bold text-foreground mb-2">Bergabung sebagai Influencer</h1>
          <p className="text-muted-foreground">Buat akun influencer untuk berkolaborasi dengan brand</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Daftar Influencer</CardTitle>
            <CardDescription>Isi data berikut untuk membuat akun influencer baru</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username Instagram</Label>
              <Input id="username" type="text" placeholder="@yourusername" className="w-full" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="influencer@email.com" className="w-full" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" placeholder="••••••••" className="w-full" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Konfirmasi Password</Label>
              <Input id="confirmPassword" type="password" placeholder="••••••••" className="w-full" />
            </div>

            <div className="flex items-start space-x-2">
              <input type="checkbox" id="terms" className="rounded mt-1 flex-shrink-0" />
              <Label htmlFor="terms" className="text-sm">
                Saya setuju dengan{" "}
                <Link href="#" className="text-primary hover:underline">
                  S&K
                </Link>{" "}
                dan{" "}
                <Link href="#" className="text-primary hover:underline">
                  Kebijakan Privasi
                </Link>
              </Label>
            </div>

            <Button className="w-full" size="lg">
              Buat Akun Influencer
            </Button>

            <Separator />

            <div className="text-center">
              <p className="text-muted-foreground text-sm">
                Sudah punya akun influencer?{" "}
                <Link href="/login/influencer" className="text-primary hover:underline font-medium">
                  Masuk sekarang
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
