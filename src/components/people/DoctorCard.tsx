"use client";

import Image from "next/image";
import { useState } from "react";
import { Phone, UserRound } from "lucide-react";
import type { DoctorProfile } from "@/config/site";
import { getDoctorCallUrl } from "@/lib/utils";

type DoctorCardProps = {
  doctor: DoctorProfile;
};

export function DoctorCard({ doctor }: DoctorCardProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const initials = doctor.name
    .replace(/^Dr\.\s*/i, "")
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2);
  const showImage = doctor.imageAvailable !== false && !imageFailed;

  return (
    <article className="card-premium overflow-hidden">
      <div className="relative min-h-72 bg-gradient-to-br from-slate-100 via-cyan-50 to-white">
        {showImage ? (
          <Image
            src={doctor.image}
            alt={`${doctor.name}, Nova Diagnostics`}
            fill
            sizes="(min-width: 1024px) 36vw, 100vw"
            className="object-cover object-top"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <div className="flex h-72 items-center justify-center p-8 text-center">
            <div>
              <span className="mx-auto flex size-20 items-center justify-center rounded-[8px] bg-white text-2xl font-semibold text-[#061A33] shadow-sm">
                {initials || <UserRound className="size-8" aria-hidden="true" />}
              </span>
              <p className="mt-4 text-sm font-semibold text-slate-950">
                Add doctor photo
              </p>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                Save the image at {doctor.image}
              </p>
            </div>
          </div>
        )}
      </div>
      <div className="p-6">
        <p className="text-sm font-semibold uppercase text-teal-700">
          Medical Leadership
        </p>
        <h3 className="mt-2 text-2xl font-semibold text-slate-950">
          {doctor.name}
        </h3>
        <p className="mt-1 font-medium text-slate-600">{doctor.degree}</p>
        <p className="mt-4 text-sm leading-6 text-slate-600">{doctor.bio}</p>
        <a href={getDoctorCallUrl(doctor.phone)} className="btn-secondary mt-5 w-full">
          <Phone className="size-4" aria-hidden="true" />
          {doctor.displayPhone}
        </a>
      </div>
    </article>
  );
}
