import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Target, Users } from "lucide-react"
import Link from "next/link"

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali ke beranda
          </Link>

          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-xl">I</span>
            </div>
            <span className="text-2xl font-bold text-foreground">Influensure</span>
          </div>

          <h1 className="text-2xl font-bold text-foreground mb-2">Masuk ke Akun Anda</h1>
          <p className="text-muted-foreground">Pilih jenis akun untuk melanjutkan</p>
        </div>

        <div className="space-y-4 mb-6">
          <Card className="hover:shadow-md transition-shadow cursor-pointer group">
            <Link href="/login/brand">
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Target className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg group-hover:text-primary transition-colors">
                      Login sebagai Brand
                    </CardTitle>
                    <CardDescription className="text-sm">
                      Akses dashboard untuk mengelola campaign dan mencari influencer
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Link>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer group">
            <Link href="/login/influencer">
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg group-hover:text-primary transition-colors">
                      Login sebagai Influencer
                    </CardTitle>
                    <CardDescription className="text-sm">
                      Akses dashboard untuk mengelola profil dan menerima campaign
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Link>
          </Card>
        </div>

        <div className="text-center">
          <p className="text-muted-foreground text-sm">
            Belum punya akun?{" "}
            <Link href="/register" className="text-primary hover:underline font-medium">
              Daftar sekarang
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
