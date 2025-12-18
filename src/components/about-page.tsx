"use client";

import { motion } from "framer-motion";
import { Shield, Award, Sparkles, Globe } from "lucide-react";
import Image from "next/image";

const stats = [
  { label: "Active Users", value: "10k+", icon: Globe },
  { label: "Connections Made", value: "2M+", icon: Sparkles },
  { label: "Enterprise Trusted", value: "500+", icon: Shield },
  { label: "Award Winning", value: "12", icon: Award },
];

export default function AboutUs() {
  return (
    <section id="about" className="py-20 bg-white overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="flex-1"
          >
            <div className="inline-block px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold mb-5">
              OUR MISSION
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-6 leading-tight">
              Empowering Professionals with <span className="text-primary">Next-Gen</span> Automation
            </h2>
            <p className="text-lg text-slate-600 mb-8 leading-relaxed">
              At Postsiva, we believe that professional networking should be about building 
              relationships, not performing repetitive tasks. Our platform is built on 
              state-of-the-art AI to help you scale your LinkedIn presence safely and effectively.
            </p>
            
            <div className="grid grid-cols-2 gap-6">
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 * index }}
                  className="flex flex-col gap-1.5"
                >
                  <div className="flex items-center gap-2.5 text-primary">
                    <stat.icon className="w-4 h-4" />
                    <span className="text-2xl font-black text-slate-900">{stat.value}</span>
                  </div>
                  <span className="text-slate-500 font-medium text-xs uppercase tracking-wider">{stat.label}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="flex-1 relative max-w-md mx-auto lg:max-w-none"
          >
            <div className="absolute inset-0 bg-primary/20 blur-[100px] rounded-full" />
            <div className="relative bg-white p-2 rounded-4xl border border-slate-200 shadow-xl overflow-hidden rotate-2 hover:rotate-0 transition-transform duration-500">
              <div className="relative w-full h-[400px] rounded-3xl overflow-hidden">
                <Image
                  src="/Empowering-Professionals.jpg"
                  alt="Empowering Professionals with Next-Gen Automation"
                  fill
                  className="object-fill"
                />
              </div>
            </div>
            
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="absolute -bottom-6 -left-6 bg-white p-4 rounded-xl shadow-lg border border-slate-100 flex items-center gap-3 z-10"
            >
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900">Enterprise Verified</div>
                <div className="text-[10px] text-slate-500">Bank-level Security</div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
