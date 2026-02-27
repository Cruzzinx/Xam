
import re
import json

raw_data = """
📌 *XI AKUNTANSI DAN KEUANGAN LEMBAGA (AKL) 1*
| Absen | Nama                         | Email                                 | No Peserta |
| :---: | :--------------------------- | :------------------------------------ | :--------: |
| 1     | Adilla Eka Putri             | adilaaeee@gmail.com                   | 50064247   |
| 2     | Amanda Putri Ayuningtyas     | tyasnda0@gmail.com                    | 50064248   |
| 3     | Annisa Yuliana               | annisayuli0207@gmail.com              | 50064249   |
| 4     | Anom Erlangga                | anomerlangga9@gmail.com               | 50064250   |
| 5     | Arip Frazna Irawan           | almoarip1@gmail.com                   | 50064251   |
| 6     | Aulia Zahra Dewi Anggraeni   | auliazahradewianggraeni@gmail.com     | 50064252   |
| 7     | Bernadeta Moza Meidiana      | meidianabernadeta@gmail.com           | 50064253   |
| 8     | Callista Laelani Santoso     | callistalailanis@gmail.com            | 50064254   |
| 9     | Davina Febrianty             | davna5634@gmail.com                   | 50064255   |
| 10    | Dian Dwi Cahyani             | diandwicahyani12@gmail.com            | 50064256   |
| 11    | Fatih Shafa Andira           | andirashafa.fatih@gmail.com           | 50064257   |
| 12    | Fira Khairunisa Yulifar      | khaifira0@gmail.com                   | 50064258   |
| 13    | Ghazali Muhammad             | gr3005222@gmail.com                   | 50064259   |
| 14    | Hanan Aurel Ashafa           | aurelhanan07@gmail.com                | 50064260   |
| 15    | Hendika Febriani             | hendikafebriani23@gmail.com           | 50064261   |
| 16    | Jessica Kirana               | jkirana652@gmail.com                  | 50064262   |
| 17    | Juwita Puspa Indah           | juwitapuspaindah123@gmail.com         | 50064263   |
| 18    | Khaalishah Nabiilah Husnaa   | -                                     | 50064264   |
| 19    | Khumaira Syawalia            | -                                     | 50064265   |
| 20    | Mahsa Shakira                | shakiramahsa4@gmail.com               | 50064266   |
| 21    | Maylinda Abida Latifa        | maylindaabidalatifa0@gmail.com        | 50064267   |
| 22    | Meidina Putri Anggraini      | meidinaputri09087@gmail.com           | 50064268   |
| 23    | Muhammad Ikhsan Yusuf Nirwana| ikhsanyusuf071@gmail.com              | 50064269   |
| 24    | Nadia Nafisa Al Zahra        | nadianpisa52@gmail.com                | 50064270   |
| 25    | Nesya Arina Putri            | arinaputrinesya@gmail.com             | 50064271   |
| 26    | Rahma Septiani               | rahmasep2008@gmail.com                | 50064272   |
| 27    | Raina Almira Putri Yusep     | rainaalmiraputriyusep@gmail.com       | 50064273   |
| 28    | Rifqi Ambiya Fahrizi         | yantoyantowni@gmail.com               | 50064274   |
| 29    | Sang Ayu Nyoman Suva Yuthena | suvayuthena@gmail.com                 | 50064275   |
| 30    | Siti Karimah                 | sitikarimah498@gmail.com              | 50064276   |
| 31    | Siti Khumairah               | sitikhumairah2008@gmail.com           | 50064277   |
| 32    | Tirsha Rossenda              | kk06.ade14@gmail.com                  | 50064278   |
| 33    | Valery Qiretta Tambunan      | valeeagustd03@gmail.com               | 50064279   |
| 34    | Yosefine Elsa Conceta L.T    | yosefineelsa@gmail.com                | 50064280   |
| 35    | Zahra Nur Ramadhani          | zahranrrr1@gmail.com                  | 50064281   |
| 36    | Zakiyya Riza                 | rizazakiyya@gmail.com                 | 50064282   |

📌 *XI AKUNTANSI DAN KEUANGAN LEMBAGA (AKL) 2*
| Absen | Nama                           | Email                                   | No Peserta |
| :---: | :----------------------------- | :-------------------------------------- | :--------: |
| 1     | Adam Surya Gemilang            | adamsurya.hits@gmail.com                | 50064283   |
| 2     | Adelia Aulia                   | adelia.040109@gmail.com                 | 50064284   |
| 3     | Akhmaliyah Nurul Syifa         | akhmaliyahnurulsyifa01@gmail.com        | 50064285   |
| 4     | Alfira Sanaya Setiawan         | alfirasanayasetiawan@gmail.com          | 50064286   |
| 5     | Chisya Ghina Aulia             | chisyaghina@gmail.com                   | 50064287   |
| 6     | Cleva Aspasia Azky             | clevaaspasiaazky@gmail.com              | 50064288   |
| 7     | Desiana Laras                  | larasszxy@gmail.com                     | 50064289   |
| 8     | Elysia Sekar Arum              | aliennnapril10@gmail.com                | 50064290   |
| 9     | Fakhira Aghniya Mufidah        | fakhiraaghniya44@gmail.com              | 50064291   |
| 10    | Felina Sri Rahayu              | felinaasrirahayu@gmail.com              | 50064292   |
| 11    | Firly Rizki Ramadani           | firlyrizki16@gmail.com                  | 50064293   |
| 12    | Herlina Bella Febrianty        | indahbela70@gmail.com                   | 50064294   |
| 13    | Hilwah                         | aiwahilwah@gmail.com                    | 50064295   |
| 14    | Himah Bil Hikam                | himahak2@gmail.com                      | 50064296   |
| 15    | Hutri Pratiwi                  | pratiwihutri8@gmail.com                 | 50064297   |
| 16    | Indira Putri Zulaeka           | indiraaja48@gmail.com                   | 50064298   |
| 17    | Kalila Nur Fitria              | kalilal054@gmail.com                    | 50064299   |
| 18    | Kartika                        | tkar9670@gmail.com                      | 50064300   |
| 19    | Luthfiyah                      | fiyahluth82@gmail.com                   | 50064301   |
| 20    | Muhammad Razan                 | evosrazan63@gmail.com                   | 50064302   |
| 21    | Mutiara Tsaqif Sekar Purnomo   | murtiwidayati51@gmail.com               | 50064303   |
| 22    | Nayala Quinnsha Nurfaradisa    | nayalaquinshanoorfaradise@gmail.com     | 50064304   |
| 23    | Poppy Devina Wiyani            | poppyydevina@gmail.com                  | 50064305   |
| 24    | Putri Maulina                  | putrimaulina583@gmail.com               | 50064306   |
| 25    | Putri Syahfira                 | putrisyahfira31@gmail.com               | 50064307   |
| 26    | Rahmalia Nurlaely Dali         | rahmalianurlaelydali@gmail.com          | 50064308   |
| 27    | Revalina Rahmawati             | revalinarahmawati020@gmail.com          | 50064309   |
| 28    | Safitri Oktaviani              | oktavianisafitri303@gmail.com           | 50064310   |
| 29    | Salman Alfahrizi               | -                                       | 50064311   |
| 30    | Saskia Bintang Maisarah        | sszkiaaa@gmail.com                      | 50064312   |
| 31    | Satrio Dwi Pamungkas           | tiot0812@gmail.com                      | 50064313   |
| 32    | Shafa Vania Maheswari          | vania080608@gmail.com                   | 50064314   |
| 33    | Siti Karimatun Nisa Al Basith  | rimaalbasith@gmail.com                  | 50064315   |
| 34    | Steven Michael Gultom          | -                                       | 50064316   |
| 35    | Syafitri Okta Fania            | oktaofficial05@gmail.com                | 50064317   |
| 36    | Vivela Zaskia Audria           | vivelazaskia74@gmail.com                | 50064318   |

📌 *XI BISNIS DIGITAL (BD)*
| Absen | Nama                          | Email                                 | No Peserta |
| :---: | :---------------------------- | :------------------------------------ | :--------: |
| 1     | Airin Irania Rachman          | airiniraniarachman@gmail.com          | 50064423   |
| 2     | Amanda Nur Maulidia           | amandaanur14@gmail.com                | 50064424   |
| 3     | Annisa Aulia                  | annisaaulia23082008@gmail.com         | 50064425   |
| 4     | Attala Rasya Putra            | attalarasyaputra@gmail.com            | 50064426   |
| 5     | Aurel Aprilia Putri           | aurelapriliaputri961@gmail.com        | 50064427   |
| 6     | Azzahra Syifa                 | azhrasyifa1208@gmail.com              | 50064428   |
| 7     | Bunga Alifia                  | bunabint@gmail.com                    | 50064429   |
| 8     | Bunga Listy Ramadhani         | bungalistyramadhani@gmail.com         | 50064430   |
| 9     | Chindi Putri Aurellia         | chindiputriaurellia@gmail.com         | 50064431   |
| 10    | Dafina Vioza Gusma            | dafinagusma@gmail.com                 | 50064432   |
| 11    | Davin Reyfandra Ilham         | davinrevandra94@gmail.com             | 50064433   |
| 12    | Fadilatul Husna               | fadilatulh7@gmail.com                 | 50064434   |
| 13    | Fajar Nur Maulid              | fajarnurmaulid@gmail.com              | 50064435   |
| 14    | Hafizd Putuaraq Ramadhan      | hafizdputuaraq@gmail.com              | 50064436   |
| 15    | Kayla Amanda Rachman          | kaylarachman292@gmail.com             | 50064437   |
| 16    | Manuel Parlindungan Sitorus   | manuelparly03@gmail.com               | 50064438   |
| 17    | Meihatin                      | meihatinnn@gmail.com                  | 50064439   |
| 18    | Mochammad Iman Fadilah        | -                                     | 50064440   |
| 19    | Muhammad Rizky                | fhlvreza24@gmail.com                  | 50064441   |
| 20    | Muhammad Zidhan Alrahmah      | zidhanori1q@gmail.com                 | 50064442   |
| 21    | Nadhifah Adzra Yusahardi      | adznadhifa25@gmail.com                | 50064443   |
| 22    | Naura Diva Islamy Putri       | nauradiva108@gmail.com                | 50064444   |
| 23    | Nayla Himmatul Ulya           | naylahimmatul040208@gmail.com         | 50064445   |
| 24    | Neifa Emira                   | neifaemira51@gmail.com                | 50064446   |
| 25    | Niken Gandini                 | nikengandininiken@gmail.com           | 50064447   |
| 26    | Puspa Istiqomah Setiawan      | puspaistiqomahsetiawan03@gmail.com    | 50064448   |
| 27    | Rayan Aryasatya Suyadi        | rayan.suyadi@gmail.com                | 50064449   |
| 28    | Reiner Ibrahim Anamta Taufik  | reinonor4@gmail.com                   | 50064450   |
| 29    | Roditu Bimasi Atilla          | roditusila@gmail.com                  | 50064451   |
| 30    | Salwa Az Zahra                | salwaazzahra2408@gmail.com            | 50064452   |
| 31    | Syahla Salsabila              | syahlasalsa09@gmail.com               | 50064453   |
| 32    | Talita Maulina                | maulinatalitaa0309@gmail.com          | 50064454   |
| 33    | Zefanya Lestari Simarmata     | zefanyalestarisimarmata@gmail.com     | 50064455   |

📌 *XI BISNIS RITEL (BR)*
| Absen | Nama                           | Email                                 | No Peserta |
| :---: | :----------------------------- | :------------------------------------ | :--------: |
| 1     | Afifah Apriyani                | afifahapriyani814@gmail.com           | 50064389   |
| 2     | Alvi Zahra Maulida             | alvi.vivi947@gmail.com                | 50064390   |
| 3     | Alyana Syafirah                | alyanasyafirah02@gmail.com            | 50064391   |
| 4     | Anisya Putri Wulandari Dalimunte | anisyawulandari797@gmail.com        | 50064392   |
| 5     | Annisa Suryani                 | annisasuryani591@gmail.com            | 50064393   |
| 6     | Arya Rizki Dwi Putra           | aryarizkidwiputra.a2@gmail.com        | 50064394   |
| 7     | Atikah Hasna Mahdeling         | atikahhasnamahdeling@gmail.com        | 50064395   |
| 8     | Azwa Zahra Apriany             | azwzhra2504@gmail.com                 | 50064396   |
| 9     | Carissa Putri                  | carissaputri.j09@gmail.com            | 50064397   |
| 10    | Devira Farannisa               | farannisadevira20@gmail.com           | 50064398   |
| 11    | Dila Oktavianti                | dilaoktavianti13@gmail.com            | 50064399   |
| 12    | Dinara Falia                   | alafalia49@gmail.com                  | 50064400   |
| 13    | Divara Rifani                  | divararifani@gmail.com                | 50064401   |
| 14    | Dwi Nur Atika                  | dwiatika2309@gmail.com                | 50064402   |
| 15    | Fajar Wiguna                   | fazarhythm@gmail.com                  | 50064403   |
| 16    | Farhan Putra Kusuma            | farhanputra4258@gmail.com             | 50064404   |
| 17    | Felita Delfina Putri Setiadi   | felitadelfinaputri@gmail.com          | 50064405   |
| 18    | Firhan Akmal Pranowo           | pranowofirhanakmal@gmail.com          | 50064406   |
| 19    | Inayah Rahma                   | inayahrahma2008@gmail.com             | 50064407   |
| 20    | Muhammad Bintang Ramadhan      | muhammadbintangramadhan35@gmail.com   | 50064408   |
| 21    | Muhammad Fikriansyah           | mfikri8a@gmail.com                    | 50064409   |
| 22    | Naswa Sabilah                  | naswasabilah5@gmail.com               | 50064410   |
| 23    | Nasyifa Anggraeni              | nasyifaanggraeni02@gmail.com          | 50064411   |
| 24    | Nazwa Salsabila                | nazwasalsabila8994@gmail.com          | 50064412   |
| 25    | Noviana Khasanah Cynthia       | cynthianovianakhasanah@gmail.com      | 50064413   |
| 26    | Nuri Reka Prasetyo             | nurirekaprasetyo@gmail.com            | 50064414   |
| 27    | Rika Andini Paslah             | paslahrika@gmail.com                  | 50064415   |
| 28    | Rizky Bunga Liv Raditia        | bungaliv26@gmail.com                  | 50064416   |
| 29    | Sakti Khadafi                  | -                                     | 50064417   |
| 30    | Siti Atikah Adzra              | adisuryadiahmad@gmail.com             | 50064418   |
| 31    | Syakira Aulia Tabriz           | syakiraauliatabriz@gmail.com          | 50064419   |
| 32    | Tiara Aryani Dewi              | dewitiaraaryani@gmail.com             | 50064420   |
| 33    | Vindy Hikaru Radiant           | vindy.hikaru11@gmail.com              | 50064421   |
| 34    | Zahranny Maulida               | zahrannym@gmail.com                   | 50064422   |

📌 *XI MANAJEMEN LOGISTIK (ML)*
| Absen | Nama                         | Email                                 | No Peserta |
| :---: | :--------------------------- | :------------------------------------ | :--------: |
| 1     | Aini Dwi Fadilah             | ainifadilajakarta@gmail.com           | 50064354   |
| 2     | Aisyah Rahmakamila           | aisyahr2801@gmail.com                 | -          |
| 3     | Arga Riski Nasution          | argarizki640@gmail.com                | 50064356   |
| 4     | Aulia Nurhalizah             | aulianurhalizah26@gmail.com           | 50064357   |
| 5     | Bilqiesyah Hafidz            | bilqiesyahhafidz1007@gmail.com        | 50064358   |
| 6     | Christopher Adbeel           | christopheradbeeltambunan@gmail.com   | -          |
| 7     | Citra Sanjaya                | sanjayacitra19@gmail.com              | 50064359   |
| 8     | Cut Nur Syifa                | cutnursyifa1712@gmail.com             | 50064360   |
| 9     | Destri Chaiza Latifah Bahar  | chaiza.destri@gmail.com               | 50064361   |
| 10    | Fakhriy Mu'ammar             | muammarfakhriy@gmail.com              | 50064362   |
| 11    | Fasahat Arimbi Subhi         | fasahatarimbi23@gmail.com             | 50064363   |
| 12    | Ghizka Maulidya Ishak        | gzkm12@gmail.com                      | 50064364   |
| 13    | Hatta Sanjaya                | hatta27sanjaya@gmail.com              | 50064365   |
| 14    | Ika Wahyu Ningsih            | ikawahyuningsih2707@gmail.com         | 50064366   |
| 15    | Indri Nabilla                | indrinabilla17@gmail.com              | -          |
| 16    | Ivana Syahda Bustami         | ivanasyahda85@gmail.com               | 50064367   |
| 17    | Jhanifatul Umayah            | jhanifatul307@gmail.com               | 50064368   |
| 18    | Karisha Apsarani             | karisharani790@gmail.com              | 50064369   |
| 19    | Kristian Anggiat Partogi Sitio | tian09062024@gmail.com              | 50064370   |
| 20    | Lu'ay Naja Zahrani           | luayzahrani@gmail.com                 | 50064371   |
| 21    | Maudi Nur'Aini               | maudinuraini31@gmail.com              | 50064372   |
| 22    | Mochammad Hafizh Nur Ilmy    | mhafizhnurilmy@gmail.com              | 50064373   |
| 23    | Muhammad Adnan Zaidan        | adnanzaidanmuhammad@gmail.com         | 50064374   |
| 24    | Muhammad Gaspar Liwu Sadipun | muhammadgaspar500@gmail.com           | 50064375   |
| 25    | Muhammad Ghaisan             | muhammadghaisannn19@gmail.com         | 50064376   |
| 26    | Muhammad Kasyful Anwar       | muhammadkasip85@gmail.com             | 50064377   |
| 27    | Muhammad Ridho Al Ayubi      | mr9141082@gmail.com                   | 50064378   |
| 28    | Nova Dwi Anjani              | novadwianjani6@gmail.com              | 50064379   |
| 29    | Radistiara Zamira            | radistiara05@gmail.com                | 50064380   |
| 30    | Rafif Mujahid Anjarang       | rafif.mujahid2022@gmail.com           | 50064381   |
| 31    | Rashafa Azka Fadlillah       | azkarashafa@gmail.com                 | 50064382   |
| 32    | Shavick Sekewael             | sekewaelshavick96@gmail.com           | 50064383   |
| 33    | Siti Faizah                  | faizahs930@gmail.com                  | 50064384   |
| 34    | Tarina Apita Sari            | tarinaapita@gmail.com                 | 50064385   |
| 35    | Tiyana                       | tiyadefa11@gmail.com                  | 50064386   |
| 36    | Yonathan Dave Mailangkay     | -                                     | 50064387   |
| 37    | Zahrul Milal                 | zahrul2512milal@gmail.com             | 50064388   |

📌 *XI MANAJEMEN PERKANTORAN DAN LAYANAN BISNIS (MP)*
| Absen | Nama                           | Email                                 | No Peserta |
| :---: | :----------------------------- | :------------------------------------ | :--------: |
| 1     | Abriela Syifa Ady Nasution     | alfabelabel@gmail.com                 | 50064319   |
| 2     | Aisha Nindya Ernangga          | aishanindya1604@gmail.com             | 50064320   |
| 3     | Anggita Indah Cahaya           | anggitaindahcahya@gmail.com           | 50064321   |
| 4     | Ayudia Rinjani                 | ayudiarinjani06@gmail.com             | 50064322   |
| 5     | Bernadette Letycia Septiandri  | bernadetteletycia@gmail.com           | 50064323   |
| 6     | Bilqis Rahadatul Wafiyyah      | bilqisrahadatulw@gmail.com            | 50064324   |
| 7     | Bunga Calista Cahaya Firdha    | bungacalistacahayafirdha11@gmail.com  | 50064325   |
| 8     | Cesya Nayla Ayudi              | cesyanayudi@gmail.com                 | 50064326   |
| 9     | Christopher Adbeel Tambunan    | -                                     | 50064327   |
| 10    | Febiyanti Zahratusyita         | febiy732@gmail.com                    | 50064328   |
| 11    | Galih Mahardika                | galihmahardika2511@gmail.com          | 50064329   |
| 12    | Hadisty Vitriya                | hadistyvitriya@gmail.com              | 50064330   |
| 13    | Havifa Latif                   | latifhavifa@gmail.com                 | 50064331   |
| 14    | Indri Nabilla                  | -                                     | 50064332   |
| 15    | Ira Brilianti Putri            | irabriliantiputri10@gmail.com         | 50064333   |
| 16    | Ivana Rossy Chan               | ivanarossy789@gmail.com               | 50064334   |
| 17    | Jihan Nur Azizah               | nurazizahjihan083@gmail.com           | 50064335   |
| 18    | Jihan Putri Fauzieta           | jihanputrifauzieta@gmail.com          | 50064336   |
| 19    | Katherine Sandy Pramesti       | katherinesandypramesti@gmail.com      | 50064337   |
| 20    | Kinanti Puspita Ayuandira      | puspitakinanti41@gmail.com            | 50064338   |
| 21    | Kirana Zalika Febrilia         | kiranaqulbu@gmail.com                 | 50064339   |
| 22    | Labiq Maulida                  | labiqmaulida@gmail.com                | 50064340   |
| 23    | Maoedy Putri Diantami          | tachibanahyun@gmail.com               | 50064341   |
| 24    | Muhamad Fadhilah Haykal        | mfh40209@gmail.com                    | 50064342   |
| 25    | Nayla Putri Agustin            | nyl.ptr2008@gmail.com                 | 50064343   |
| 26    | Nayla Ramadhani                | naylaaramadhani010808@gmail.com       | 50064344   |
| 27    | Novianti Quen Malaika          | noviim888@gmail.com                   | 50064345   |
| 28    | Puspita Pertiwi                | diahratna141@gmail.com                | 50064346   |
| 29    | Raihanna Salsabila             | raihannasalsabila07@gmail.com         | 50064347   |
| 30    | Risky Saputra                  | rs9625016@gmail.com                   | 50064348   |
| 31    | Safira Adyabra Nanditi         | nanditisafiraadyabra@gmail.com        | 50064349   |
| 32    | Satria Mahardika               | mahardikasatria2606@gmail.com         | 50064350   |
| 33    | Soffie Alyamarwa               | sfflymrwa@gmail.com                   | 50064351   |
| 34    | Syifa Nur Rahma                | syifanurrahma05@gmail.com             | 50064352   |
| 35    | Zahra Aulia                    | zahraaulia28209@gmail.com             | 50064353   |
| 36    | Zeni Alvira Putri              | rhefafitria@gmail.com                 | -          |
"""

sections = re.split(r'📌 \*', raw_data)
all_students = []

for section in sections[1:]:
    lines = section.strip().split('\n')
    kelas_name = lines[0].strip().replace('*', '')
    
    for line in lines[3:]:  # Skip header and separator
        if '|' in line:
            parts = [p.strip() for p in line.split('|')]
            if len(parts) >= 5:
                absen = parts[1]
                nama = parts[2]
                email = parts[3]
                no_peserta = parts[4]
                
                # Cleanup email
                if email == '-':
                    email = f"{nama.lower().replace(' ', '.')}.{absen}@example.com"
                
                all_students.append({
                    'name': nama,
                    'email': email,
                    'no_peserta': no_peserta,
                    'kelas': kelas_name
                })

# Save to a temporary php source file
with open('students_data.json', 'w') as f:
    json.dump(all_students, f, indent=4)

print(f"Parsed {len(all_students)} students.")
