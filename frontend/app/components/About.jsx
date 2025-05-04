import React from 'react'
import Image from "next/image";
import {assets, infoList} from "@/assets/assets";

const About = () => {
    return (
        <div id={'about'} className={'w-full px-[-12px] py-30 scroll-mt-20'}>
            <h4 className={'text-center mb-3 text-lg-font-Ovo'}>Introduction</h4>
            <h2 className={'text-center text-5xl font-Ovo'}>About Me</h2>

            <div className={'flex w-full flex-col lg:flex-row items-center gap-10 my-10'}>
                <div className={'w-64 sm:w-80 rounded-2xl max-w-none ml-10'}>
                    <Image src={assets.user_image} alt={'user'} className={'w-full rounded-full'}/>
                </div>
                <div className={'flex-1'}>
                    <p className={'mb-10 max-w-2xl font-serif'}>I’m a software engineer with 5 years of experience building solutions with Python, JavaScript, SQL, and Aws cloud tools —
                        combining software development with data science, security, and AI and I’m deeply interested in quantum computing research.
                    </p>
                    <ul className={'grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl '}>
                        {infoList.map(({icon,iconDark,title,description},index) => (
                            <li key={index} className={'border-[0.5px] border-gray-400 rounded-xl p-3 cursor-pointer hover:-translate-y-1 hover:bg-amber-100 hover:shadow-amber-100 transition duration-500'}>
                                <Image src={icon} alt={'title'} className={'m-t-3 w-6'} />
                                <h3 className={'text-gray-700 font-semibold text-xl my-3'}>
                                    {title}
                                </h3>
                                <p className={'text-gray-400 text-sm'}>
                                    {description}
                                </p>
                            </li>
                        ))}
                    </ul>
                    <h4>
                        Tools I use:
                    </h4>
                    <ul>

                    </ul>

                </div>
            </div>


        </div>
    )
}
export default About
