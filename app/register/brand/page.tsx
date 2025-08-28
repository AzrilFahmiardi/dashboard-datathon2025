"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Target, Loader2 } from "lucide-react"
import Link from "next/link"
import { registerBrand } from "@/lib/auth"
import { toast } from "sonner"

export default function BrandRegisterPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false
  })
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Password dan konfirmasi password tidak cocok')
      return
    }

    if (!formData.acceptTerms) {
      toast.error('Harap setujui syarat dan ketentuan')
      return
    }

    setIsLoading(true)

    try {
      await registerBrand(formData.email, formData.password, formData.username)
      
      toast.success('Akun brand berhasil dibuat!')
      router.push('/dashboard/brand')
    } catch (error: any) {
      console.error('Registration error:', error)
      
      // Handle specific Firebase errors
      let errorMessage = 'Gagal membuat akun. Silakan coba lagi.'
      
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Email sudah digunakan. Gunakan email lain atau login.'
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password terlalu lemah. Minimal 6 karakter.'
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Format email tidak valid.'
      }
      
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

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
              <Target className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold text-foreground">Brand Register</span>
          </div>

          <h1 className="text-2xl font-bold text-foreground mb-2">Bergabung sebagai Brand</h1>
          <p className="text-muted-foreground">Buat akun brand untuk menjalankan campaign influencer marketing</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Daftar Brand</CardTitle>
            <CardDescription>Isi data berikut untuk membuat akun brand baru</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username Instagram</Label>
                <Input 
                  id="username"
                  name="username"
                  type="text" 
                  placeholder="@brandname" 
                  className="w-full"
                  value={formData.username}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email"
                  name="email"
                  type="email" 
                  placeholder="brand@company.com" 
                  className="w-full"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input 
                  id="password"
                  name="password"
                  type="password" 
                  placeholder="••••••••" 
                  className="w-full"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength={6}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Konfirmasi Password</Label>
                <Input 
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password" 
                  placeholder="••••••••" 
                  className="w-full"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="flex items-start space-x-2">
                <input 
                  type="checkbox" 
                  id="terms"
                  name="acceptTerms"
                  className="rounded mt-1 flex-shrink-0"
                  checked={formData.acceptTerms}
                  onChange={handleChange}
                  required
                />
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

              <Button className="w-full" size="lg" type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Membuat Akun...
                  </>
                ) : (
                  'Buat Akun Brand'
                )}
              </Button>

              <Separator />

              <div className="text-center">
                <p className="text-muted-foreground text-sm">
                  Sudah punya akun brand?{" "}
                  <Link href="/login/brand" className="text-primary hover:underline font-medium">
                    Masuk sekarang
                  </Link>
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
