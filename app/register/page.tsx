import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Target, Users } from "lucide-react"
import Link from "next/link"

export default function RegisterPage() {
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

          <h1 className="text-2xl font-bold text-foreground mb-2">Buat Akun Baru</h1>
          <p className="text-muted-foreground">Pilih jenis akun yang ingin Anda buat</p>
        </div>

        <div className="space-y-4 mb-6">
          <Card className="hover:shadow-md transition-shadow cursor-pointer group">
            <Link href="/register/brand">
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Target className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg group-hover:text-primary transition-colors">
                      Daftar sebagai Brand
                    </CardTitle>
                    <CardDescription className="text-sm">
                      Untuk perusahaan yang ingin menjalankan campaign influencer marketing
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Link>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer group">
            <Link href="/register/influencer">
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg group-hover:text-primary transition-colors">
                      Daftar sebagai Influencer
                    </CardTitle>
                    <CardDescription className="text-sm">
                      Untuk content creator yang ingin berkolaborasi dengan brand
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Link>
          </Card>
        </div>

        <div className="text-center">
          <p className="text-muted-foreground text-sm">
            Sudah punya akun?{" "}
            <Link href="/login" className="text-primary hover:underline font-medium">
              Masuk sekarang
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
