import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '../../Layouts/AppLayout';
import Card from '../../Components/Card';
import { BookOpen } from 'lucide-react';

export default function Index() {
    const guides = [
        { title: 'ODC 1 Phase', desc: 'Panduan konstruksi pondasi, pengkabelan PLN, ATS manual, dan instalasi rack 1 Phase.', link: '/instruction/ODC%201%20Phase' },
        { title: 'ODC 3 Phase', desc: 'Pemeriksaan suplai daya 3 Phase, panel ATS/AMF modul pintar, grounding grid, dan dual cooling fan.', link: '/instruction/ODC%203%20Phase' },
        { title: 'Shelter CME', desc: 'Panduan standar sipil beton pondasi kerangkeng hollow, penangkal petir, AC Split, dan RBS cabinet.', link: '/instruction/Shelter%20CME' },
    ];

    return (
        <>
            <Head title="Panduan Teknis (SOW) - Web CME" />

            <div className="mb-6">
                <h1 className="text-2xl font-bold tracking-tight text-gray-900 font-headlines">
                    Panduan Teknis &amp; Spesifikasi (SOW)
                </h1>
                <p className="text-sm text-gray-500 font-headlines mt-1">
                    Pedoman standar konstruksi sipil, kelistrikan, dan mekanikal untuk vendor pelaksana.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {guides.map((g, idx) => (
                    <Card
                        key={idx}
                        title={`📘 ${g.title}`}
                        className="hover:-translate-y-0.5 transition duration-200"
                    >
                        <p className="text-xs text-gray-500 leading-relaxed min-h-[50px] mb-4">
                            {g.desc}
                        </p>
                        <Link
                            href={g.link}
                            className="inline-flex w-full items-center justify-center py-2 bg-gray-900 hover:bg-black text-white text-xs font-bold uppercase rounded-lg tracking-wider transition"
                        >
                            Buka Panduan &rarr;
                        </Link>
                    </Card>
                ))}
            </div>
        </>
    );
}


Index.layout = page => <AppLayout children={page} />;
