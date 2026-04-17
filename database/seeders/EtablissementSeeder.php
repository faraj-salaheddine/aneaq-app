<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Etablissement;

class EtablissementSeeder extends Seeder
{
    public function run(): void
    {
        Etablissement::create([
            'acronyme' => 'ENCG',
            'domaine_connaissances' => 'Commerce et gestion',
            'evaluation' => null,
            'etablissement' => 'Ecoles Nationales de Commerce et de Gestion',
            'etablissement_2' => 'Ecoles Nationales de Commerce et de Gestion',
            'ville' => 'Agadir',
            'universite' => 'Université Ibn Zohr Agadir',
        ]);

        Etablissement::create([
            'acronyme' => 'ENCG',
            'domaine_connaissances' => 'Commerce et gestion',
            'evaluation' => 'évalué_a',
            'etablissement' => 'Ecoles Nationales de Commerce et de Gestion',
            'etablissement_2' => 'Ecoles Nationales de Commerce et de Gestion',
            'ville' => 'Dakhla',
            'universite' => 'Université Ibn Zohr Agadir',
        ]);

        Etablissement::create([
            'acronyme' => 'EST',
            'domaine_connaissances' => 'Technologie',
            'evaluation' => null,
            'etablissement' => 'Écoles supérieures de technologie',
            'etablissement_2' => 'Écoles supérieures de technologie',
            'ville' => 'Agadir',
            'universite' => 'Université Ibn Zohr Agadir',
        ]);

        Etablissement::create([
            'acronyme' => 'ESEF',
            'domaine_connaissances' => 'Education et formation',
            'evaluation' => null,
            'etablissement' => 'Ecole Supérieure de l\'Education et de la Formation',
            'etablissement_2' => 'Ecole Supérieure de l\'Education et de la Formation',
            'ville' => 'Agadir',
            'universite' => 'Université Ibn Zohr Agadir',
        ]);

        Etablissement::create([
            'acronyme' => 'FC',
            'domaine_connaissances' => 'Etudes islamiques',
            'evaluation' => null,
            'etablissement' => 'Faculté Chariaa',
            'etablissement_2' => 'Faculté Chariaa Ait Melloul ',
            'ville' => 'Ait Melloul ',
            'universite' => 'Université Ibn Zohr Agadir',
        ]);

        Etablissement::create([
            'acronyme' => 'FEG',
            'domaine_connaissances' => 'sciences juridiques, économiques et sociales',
            'evaluation' => null,
            'etablissement' => 'Faculté d\'Economie et de Gestion',
            'etablissement_2' => 'Faculté d\'Economie et de Gestion',
            'ville' => 'Guelmim ',
            'universite' => 'Université Ibn Zohr Agadir',
        ]);

        Etablissement::create([
            'acronyme' => 'FLASH',
            'domaine_connaissances' => 'Lettres et sciences humaines',
            'evaluation' => null,
            'etablissement' => 'Faculté des Langues, des Arts et des Sciences Humaines',
            'etablissement_2' => 'Faculté des Langues, des Arts et des Sciences Humaines',
            'ville' => 'Ait Melloul ',
            'universite' => 'Université Ibn Zohr Agadir',
        ]);

        Etablissement::create([
            'acronyme' => 'FLSH',
            'domaine_connaissances' => 'Lettres et sciences humaines',
            'evaluation' => 'évalué',
            'etablissement' => 'Facultés de Médecine et de Pharmacie',
            'etablissement_2' => 'Facultés de Médecine et de Pharmacie',
            'ville' => 'Agadir',
            'universite' => 'Université Ibn Zohr Agadir',
        ]);

        Etablissement::create([
            'acronyme' => 'FMP',
            'domaine_connaissances' => 'Medecine et pharmacie',
            'evaluation' => null,
            'etablissement' => 'Facultés de Médecine et de Pharmacie',
            'etablissement_2' => 'Facultés de Médecine et de Pharmacie',
            'ville' => 'Agadir',
            'universite' => 'Université Ibn Zohr Agadir',
        ]);

        Etablissement::create([
            'acronyme' => 'FMP',
            'domaine_connaissances' => 'Medecine et pharmacie',
            'evaluation' => null,
            'etablissement' => 'Facultés de Médecine et de Pharmacie',
            'etablissement_2' => 'Facultés de Médecine et de Pharmacie',
            'ville' => 'Laayoune ',
            'universite' => 'Université Ibn Zohr Agadir',
        ]);

        Etablissement::create([
            'acronyme' => 'EST',
            'domaine_connaissances' => 'Technologie',
            'evaluation' => null,
            'etablissement' => 'Écoles supérieures de technologie',
            'etablissement_2' => 'Écoles supérieures de technologie',
            'ville' => 'Dakhla',
            'universite' => 'Université Ibn Zohr Agadir',
        ]);

        Etablissement::create([
            'acronyme' => 'EST',
            'domaine_connaissances' => 'Technologie',
            'evaluation' => null,
            'etablissement' => 'Écoles supérieures de technologie',
            'etablissement_2' => 'Écoles supérieures de technologie',
            'ville' => 'Laayoune ',
            'universite' => 'Université Ibn Zohr Agadir',
        ]);

        Etablissement::create([
            'acronyme' => 'EST',
            'domaine_connaissances' => 'Technologie',
            'evaluation' => null,
            'etablissement' => 'Écoles supérieures de technologie',
            'etablissement_2' => 'Écoles supérieures de technologie',
            'ville' => 'Ouarzazate  ',
            'universite' => 'Université Ibn Zohr Agadir',
        ]);

        Etablissement::create([
            'acronyme' => 'EST',
            'domaine_connaissances' => 'Technologie',
            'evaluation' => null,
            'etablissement' => 'Écoles supérieures de technologie',
            'etablissement_2' => 'Écoles supérieures de technologie',
            'ville' => 'Kenitra',
            'universite' => 'Université Ibn Tofail kénitra',
        ]);

        Etablissement::create([
            'acronyme' => 'EST',
            'domaine_connaissances' => 'Technologie',
            'evaluation' => null,
            'etablissement' => 'Écoles supérieures de technologie',
            'etablissement_2' => 'Écoles supérieures de technologie',
            'ville' => 'Casablanca',
            'universite' => 'Université Hassan 2 de Casablanca',
        ]);

        Etablissement::create([
            'acronyme' => 'EST',
            'domaine_connaissances' => 'Technologie',
            'evaluation' => 'évalué_a',
            'etablissement' => 'Écoles supérieures de technologie',
            'etablissement_2' => 'Écoles supérieures de technologie',
            'ville' => 'Guelmim ',
            'universite' => 'Université Ibn Zohr Agadir',
        ]);

        Etablissement::create([
            'acronyme' => 'FP',
            'domaine_connaissances' => 'Polydesciplinaire',
            'evaluation' => null,
            'etablissement' => 'Faculté Polydisciplinaire ',
            'etablissement_2' => 'Faculté Polydisciplinaire ',
            'ville' => 'Samara ',
            'universite' => 'Université Ibn Zohr Agadir',
        ]);

        Etablissement::create([
            'acronyme' => 'FP',
            'domaine_connaissances' => 'Polydesciplinaire',
            'evaluation' => null,
            'etablissement' => 'Faculté Polydisciplinaire ',
            'etablissement_2' => 'Faculté Polydisciplinaire ',
            'ville' => 'Taroudant ',
            'universite' => 'Université Ibn Zohr Agadir',
        ]);

        Etablissement::create([
            'acronyme' => 'FP',
            'domaine_connaissances' => 'Polydesciplinaire',
            'evaluation' => 'évalué_a',
            'etablissement' => 'Faculté Polydisciplinaire ',
            'etablissement_2' => 'Faculté Polydisciplinaire ',
            'ville' => 'Ouarzazate  ',
            'universite' => 'Université Ibn Zohr Agadir',
        ]);

        Etablissement::create([
            'acronyme' => 'FSJES',
            'domaine_connaissances' => 'sciences juridiques, économiques et sociales',
            'evaluation' => null,
            'etablissement' => 'Faculté des Sciences Juridiques Economiques et Sociales',
            'etablissement_2' => 'Faculté des Sciences Juridiques Economiques et Sociales',
            'ville' => 'Agadir',
            'universite' => 'Université Ibn Zohr Agadir',
        ]);

        Etablissement::create([
            'acronyme' => 'FSJES',
            'domaine_connaissances' => 'sciences juridiques, économiques et sociales',
            'evaluation' => null,
            'etablissement' => 'Faculté des Sciences Juridiques Economiques et Sociales',
            'etablissement_2' => 'Faculté des Sciences Juridiques Economiques et Sociales',
            'ville' => 'Ait Melloul ',
            'universite' => 'Université Ibn Zohr Agadir',
        ]);

        Etablissement::create([
            'acronyme' => 'FMP',
            'domaine_connaissances' => 'Medecine et pharmacie',
            'evaluation' => null,
            'etablissement' => 'Facultés de Médecine et de Pharmacie',
            'etablissement_2' => 'Facultés de Médecine et de Pharmacie',
            'ville' => 'Guelmim ',
            'universite' => 'Université Ibn Zohr Agadir',
        ]);

        Etablissement::create([
            'acronyme' => 'EST',
            'domaine_connaissances' => 'Technologie',
            'evaluation' => null,
            'etablissement' => 'Écoles supérieures de technologie',
            'etablissement_2' => 'Écoles supérieures de technologie',
            'ville' => 'Beni-Mellal ',
            'universite' => 'Université Sultan Moulay Slimane béni mellal',
        ]);

        Etablissement::create([
            'acronyme' => 'ENCG',
            'domaine_connaissances' => 'Commerce et gestion',
            'evaluation' => 'évalué',
            'etablissement' => 'Ecoles Nationales de Commerce et de Gestion',
            'etablissement_2' => 'Ecoles Nationales de Commerce et de Gestion',
            'ville' => 'Kenitra',
            'universite' => 'Université Ibn Tofail kénitra',
        ]);

        Etablissement::create([
            'acronyme' => 'EST',
            'domaine_connaissances' => 'Technologie',
            'evaluation' => null,
            'etablissement' => 'Écoles supérieures de technologie',
            'etablissement_2' => 'Écoles supérieures de technologie',
            'ville' => 'Fquih Ben Salah ',
            'universite' => 'Université Sultan Moulay Slimane béni mellal',
        ]);

        Etablissement::create([
            'acronyme' => 'EST',
            'domaine_connaissances' => 'Technologie',
            'evaluation' => null,
            'etablissement' => 'Écoles supérieures de technologie',
            'etablissement_2' => 'Écoles supérieures de technologie',
            'ville' => 'Safi',
            'universite' => 'l\'Université Cadi Ayyad Marrakech',
        ]);

        Etablissement::create([
            'acronyme' => 'ESEF',
            'domaine_connaissances' => 'Education et formation',
            'evaluation' => null,
            'etablissement' => 'Ecole Supérieure de l\'Education et de la Formation',
            'etablissement_2' => 'Ecole Supérieure de l\'Education et de la Formation',
            'ville' => 'Kenitra',
            'universite' => 'Université Ibn Tofail kénitra',
        ]);

        Etablissement::create([
            'acronyme' => 'FEG',
            'domaine_connaissances' => 'sciences juridiques, économiques et sociales',
            'evaluation' => null,
            'etablissement' => 'Faculté d\'Economie et de Gestion',
            'etablissement_2' => 'Faculté d\'Economie et de Gestion',
            'ville' => 'Kenitra',
            'universite' => 'Université Ibn Tofail kénitra',
        ]);

        Etablissement::create([
            'acronyme' => 'FLLA',
            'domaine_connaissances' => 'Lettres et sciences humaines',
            'evaluation' => null,
            'etablissement' => 'Faculté des Langues,des Lettres et des Arts',
            'etablissement_2' => 'Faculté des Langues,des Lettres et des Arts',
            'ville' => 'Kenitra',
            'universite' => 'Université Ibn Tofail kénitra',
        ]);

        Etablissement::create([
            'acronyme' => 'FS',
            'domaine_connaissances' => 'Sciences',
            'evaluation' => 'évalué',
            'etablissement' => 'Faculté des sciences',
            'etablissement_2' => 'Faculté des sciences',
            'ville' => 'Kenitra',
            'universite' => 'Université Ibn Tofail kénitra',
        ]);

        Etablissement::create([
            'acronyme' => 'FSHS',
            'domaine_connaissances' => 'Lettres et sciences humaines',
            'evaluation' => null,
            'etablissement' => 'Faculté des Sciences Humaines et Sociales',
            'etablissement_2' => 'Faculté des Sciences Humaines et Sociales',
            'ville' => 'Kenitra',
            'universite' => 'Université Ibn Tofail kénitra',
        ]);

        Etablissement::create([
            'acronyme' => 'FSJP',
            'domaine_connaissances' => 'sciences juridiques, économiques et sociales',
            'evaluation' => null,
            'etablissement' => 'Faculté des Sciences Juridiques et Politiques',
            'etablissement_2' => 'Faculté des Sciences Juridiques et Politiques',
            'ville' => 'Kenitra',
            'universite' => 'Université Ibn Tofail kénitra',
        ]);

        Etablissement::create([
            'acronyme' => 'IMS',
            'domaine_connaissances' => 'Sport',
            'evaluation' => null,
            'etablissement' => 'Institut des Métiers de Sport',
            'etablissement_2' => 'Institut des Métiers de Sport',
            'ville' => 'Kenitra',
            'universite' => 'Université Ibn Tofail kénitra',
        ]);

        Etablissement::create([
            'acronyme' => 'EST',
            'domaine_connaissances' => 'Technologie',
            'evaluation' => null,
            'etablissement' => 'Écoles supérieures de technologie',
            'etablissement_2' => 'Écoles supérieures de technologie',
            'ville' => 'Essaouira',
            'universite' => 'l\'Université Cadi Ayyad Marrakesh',
        ]);

        Etablissement::create([
            'acronyme' => 'ENCG',
            'domaine_connaissances' => 'Commerce et gestion',
            'evaluation' => 'évalué',
            'etablissement' => 'Ecoles Nationales de Commerce et de Gestion',
            'etablissement_2' => 'Ecoles Nationales de Commerce et de Gestion',
            'ville' => 'Settat',
            'universite' => 'Université Hassan I Settat',
        ]);

        Etablissement::create([
            'acronyme' => 'EST',
            'domaine_connaissances' => 'Technologie',
            'evaluation' => null,
            'etablissement' => 'Écoles supérieures de technologie',
            'etablissement_2' => 'Écoles supérieures de technologie',
            'ville' => 'El Kelaa des Sraghna ',
            'universite' => 'l\'Université Cadi Ayyad Marrakesh',
        ]);

        Etablissement::create([
            'acronyme' => 'ESEF',
            'domaine_connaissances' => 'Education et formation',
            'evaluation' => null,
            'etablissement' => 'Ecole Supérieure de l\'Education et de la Formation',
            'etablissement_2' => 'Ecole Supérieure de l\'Education et de la Formation',
            'ville' => 'Berrechid ',
            'universite' => 'Université Hassan I Settat',
        ]);

        Etablissement::create([
            'acronyme' => 'FEG',
            'domaine_connaissances' => 'sciences juridiques, économiques et sociales',
            'evaluation' => null,
            'etablissement' => 'Faculté d\'Economie et de Gestion',
            'etablissement_2' => 'Faculté d\'Economie et de Gestion',
            'ville' => 'Settat',
            'universite' => 'Université Hassan I Settat',
        ]);

        Etablissement::create([
            'acronyme' => 'FLASH',
            'domaine_connaissances' => 'Lettres et sciences humaines',
            'evaluation' => null,
            'etablissement' => 'Faculté des Langues, des Arts et des Sciences Humaines',
            'etablissement_2' => 'Faculté des Langues, des Arts et des Sciences Humaines',
            'ville' => 'Settat',
            'universite' => 'Université Hassan I Settat',
        ]);

        Etablissement::create([
            'acronyme' => 'FSJP',
            'domaine_connaissances' => 'sciences juridiques, économiques et sociales',
            'evaluation' => null,
            'etablissement' => 'Faculté des Sciences Juridiques et Politiques',
            'etablissement_2' => 'Faculté des Sciences Juridiques et Politiques',
            'ville' => 'Settat',
            'universite' => 'Université Hassan I Settat',
        ]);

        Etablissement::create([
            'acronyme' => 'EST',
            'domaine_connaissances' => 'Technologie',
            'evaluation' => null,
            'etablissement' => 'Écoles supérieures de technologie',
            'etablissement_2' => 'Écoles supérieures de technologie',
            'ville' => 'Fes',
            'universite' => 'Université Sidi Mohamed Ben Abdellah Fès ',
        ]);

        Etablissement::create([
            'acronyme' => 'ISS',
            'domaine_connaissances' => 'Sport',
            'evaluation' => null,
            'etablissement' => 'L\'Institut des Sciences du Sport',
            'etablissement_2' => 'L\'Institut des Sciences du Sport',
            'ville' => 'Settat',
            'universite' => 'Université Hassan I Settat',
        ]);

        Etablissement::create([
            'acronyme' => 'ISSS',
            'domaine_connaissances' => 'Santé',
            'evaluation' => null,
            'etablissement' => 'Institut Supérieur des Sciences de la Santé',
            'etablissement_2' => 'Institut Supérieur des Sciences de la Santé',
            'ville' => 'Settat',
            'universite' => 'Université Hassan I Settat',
        ]);

        Etablissement::create([
            'acronyme' => 'ENCG',
            'domaine_connaissances' => 'Commerce et gestion',
            'evaluation' => null,
            'etablissement' => 'Ecoles Nationales de Commerce et de Gestion',
            'etablissement_2' => 'Ecoles Nationales de Commerce et de Gestion',
            'ville' => 'Casablanca',
            'universite' => 'Université Hassan 2 de Casablanca',
        ]);

        Etablissement::create([
            'acronyme' => 'ENS',
            'domaine_connaissances' => 'Education et formation',
            'evaluation' => null,
            'etablissement' => 'École Normale Supérieure',
            'etablissement_2' => 'École Normale Supérieure',
            'ville' => 'Casablanca',
            'universite' => 'Université Hassan 2 de Casablanca',
        ]);

        Etablissement::create([
            'acronyme' => 'ENSAD',
            'domaine_connaissances' => 'Art et design',
            'evaluation' => null,
            'etablissement' => 'École Nationale Supérieure d\'Art et de Design',
            'etablissement_2' => 'École Nationale Supérieure d\'Art et de Design',
            'ville' => 'Casablanca',
            'universite' => 'Université Hassan 2 de Casablanca',
        ]);

        Etablissement::create([
            'acronyme' => 'ENSAM',
            'domaine_connaissances' => 'Ingénierie',
            'evaluation' => null,
            'etablissement' => 'Ecoles d\'ingénieurs ',
            'etablissement_2' => 'Ecoles Nationales Supérieures d\'Arts et Métiers',
            'ville' => 'Casablanca',
            'universite' => 'Université Hassan 2 de Casablanca',
        ]);

        Etablissement::create([
            'acronyme' => 'ENSEM',
            'domaine_connaissances' => 'Ingénierie',
            'evaluation' => null,
            'etablissement' => 'Ecoles d\'ingénieurs ',
            'etablissement_2' => 'École Nationale Supérieure d\'Électricité et de Mécanique',
            'ville' => 'Casablanca',
            'universite' => 'Université Hassan 2 de Casablanca',
        ]);

        Etablissement::create([
            'acronyme' => 'ENSET',
            'domaine_connaissances' => 'Ingénierie',
            'evaluation' => 'eval',
            'etablissement' => 'Ecoles d\'ingénieurs ',
            'etablissement_2' => 'École Normale Supérieure de l\'Enseignement Technique',
            'ville' => 'Mohammedia',
            'universite' => 'Université Hassan 2 de Casablanca',
        ]);

        Etablissement::create([
            'acronyme' => 'FLSH',
            'domaine_connaissances' => 'Lettres et sciences humaines',
            'evaluation' => null,
            'etablissement' => 'Facultés de Médecine et de Pharmacie',
            'etablissement_2' => 'Facultés de Médecine et de Pharmacie  Aïn Chock',
            'ville' => 'Casablanca',
            'universite' => 'Université Hassan 2 de Casablanca',
        ]);

        Etablissement::create([
            'acronyme' => 'FLSH',
            'domaine_connaissances' => 'Lettres et sciences humaines',
            'evaluation' => null,
            'etablissement' => 'Facultés de Médecine et de Pharmacie',
            'etablissement_2' => 'Facultés de Médecine et de Pharmacie Ben M\'sik',
            'ville' => 'Casablanca',
            'universite' => 'Université Hassan 2 de Casablanca',
        ]);

        Etablissement::create([
            'acronyme' => 'FLSH',
            'domaine_connaissances' => 'Lettres et sciences humaines',
            'evaluation' => null,
            'etablissement' => 'Facultés de Médecine et de Pharmacie',
            'etablissement_2' => 'Facultés de Médecine et de Pharmacie - Mohammedia',
            'ville' => 'Mohammedia',
            'universite' => 'Université Hassan 2 de Casablanca',
        ]);

        Etablissement::create([
            'acronyme' => 'FMD',
            'domaine_connaissances' => 'Médecine dentaire',
            'evaluation' => null,
            'etablissement' => 'Faculté de Médecine Dentaire',
            'etablissement_2' => 'Faculté de Médecine Dentaire',
            'ville' => 'Casablanca',
            'universite' => 'Université Hassan 2 de Casablanca',
        ]);

        Etablissement::create([
            'acronyme' => 'FMP',
            'domaine_connaissances' => 'Medecine et pharmacie',
            'evaluation' => null,
            'etablissement' => 'Facultés de Médecine et de Pharmacie',
            'etablissement_2' => 'Facultés de Médecine et de Pharmacie',
            'ville' => 'Casablanca',
            'universite' => 'Université Hassan 2 de Casablanca',
        ]);

        Etablissement::create([
            'acronyme' => 'EST',
            'domaine_connaissances' => 'Technologie',
            'evaluation' => null,
            'etablissement' => 'Écoles supérieures de technologie',
            'etablissement_2' => 'Écoles supérieures de technologie',
            'ville' => 'Sidi Bennour ',
            'universite' => 'Université Chouaib Doukkali El Jadida',
        ]);

        Etablissement::create([
            'acronyme' => 'FS',
            'domaine_connaissances' => 'Sciences',
            'evaluation' => 'évalué',
            'etablissement' => 'Faculté des sciences',
            'etablissement_2' => 'Faculté des Sciences Ben M\'sick',
            'ville' => 'Casablanca',
            'universite' => 'Université Hassan 2 de Casablanca',
        ]);

        Etablissement::create([
            'acronyme' => 'EST',
            'domaine_connaissances' => 'Technologie',
            'evaluation' => null,
            'etablissement' => 'Écoles supérieures de technologie',
            'etablissement_2' => 'Écoles supérieures de technologie',
            'ville' => 'Nador',
            'universite' => 'Université Mohammed Premier Oujda',
        ]);

        Etablissement::create([
            'acronyme' => 'EST',
            'domaine_connaissances' => 'Technologie',
            'evaluation' => null,
            'etablissement' => 'Écoles supérieures de technologie',
            'etablissement_2' => 'Écoles supérieures de technologie',
            'ville' => 'Meknes',
            'universite' => 'Université Moulay Ismaïl Meknès',
        ]);

        Etablissement::create([
            'acronyme' => 'FSJES',
            'domaine_connaissances' => 'sciences juridiques, économiques et sociales',
            'evaluation' => null,
            'etablissement' => 'Faculté des Sciences Juridiques Economiques et Sociales',
            'etablissement_2' => 'Faculté des Sciences Juridiques Economiques et Sociales ــ عين السبع',
            'ville' => 'Casablanca',
            'universite' => 'Université Hassan 2 de Casablanca',
        ]);

        Etablissement::create([
            'acronyme' => 'FSJES',
            'domaine_connaissances' => 'sciences juridiques, économiques et sociales',
            'evaluation' => null,
            'etablissement' => 'Faculté des Sciences Juridiques Economiques et Sociales',
            'etablissement_2' => 'Faculté des Sciences Juridiques Economiques et Sociales- عين الشق',
            'ville' => 'Casablanca',
            'universite' => 'Université Hassan 2 de Casablanca',
        ]);

        Etablissement::create([
            'acronyme' => 'FSJES',
            'domaine_connaissances' => 'sciences juridiques, économiques et sociales',
            'evaluation' => null,
            'etablissement' => 'Faculté des Sciences Juridiques Economiques et Sociales',
            'etablissement_2' => 'Faculté des Sciences Juridiques Economiques et Sociales - Mohammedia',
            'ville' => 'Mohammedia',
            'universite' => 'Université Hassan 2 de Casablanca',
        ]);

        Etablissement::create([
            'acronyme' => 'ENCG',
            'domaine_connaissances' => 'Commerce et gestion',
            'evaluation' => null,
            'etablissement' => 'Ecoles Nationales de Commerce et de Gestion',
            'etablissement_2' => 'Ecoles Nationales de Commerce et de Gestion',
            'ville' => 'Beni-Mellal ',
            'universite' => 'Université Sultan Moulay Slimane béni mellal',
        ]);

        Etablissement::create([
            'acronyme' => 'ENSC',
            'domaine_connaissances' => 'Chimie',
            'evaluation' => null,
            'etablissement' => 'École Nationale Supérieure de Chimie',
            'etablissement_2' => 'École Nationale Supérieure de Chimie',
            'ville' => 'Kenitra',
            'universite' => 'Université Ibn Tofail kénitra',
        ]);

        Etablissement::create([
            'acronyme' => 'EST',
            'domaine_connaissances' => 'Technologie',
            'evaluation' => 'évalué_a',
            'etablissement' => 'Écoles supérieures de technologie',
            'etablissement_2' => 'Écoles supérieures de technologie',
            'ville' => 'Khenifra',
            'universite' => 'Université Sultan Moulay Slimane béni mellal',
        ]);

        Etablissement::create([
            'acronyme' => 'ENSA',
            'domaine_connaissances' => 'Sciences appliquées',
            'evaluation' => null,
            'etablissement' => 'Ecoles d\'ingénieurs ',
            'etablissement_2' => 'L\'École Nationale des Sciences Appliquées',
            'ville' => 'Agadir',
            'universite' => 'Université Ibn Zohr Agadir',
        ]);

        Etablissement::create([
            'acronyme' => 'ENSA',
            'domaine_connaissances' => 'Sciences appliquées',
            'evaluation' => null,
            'etablissement' => 'Ecoles d\'ingénieurs ',
            'etablissement_2' => 'L\'École Nationale des Sciences Appliquées',
            'ville' => 'Kenitra',
            'universite' => 'Université Ibn Tofail kénitra',
        ]);

        Etablissement::create([
            'acronyme' => 'ESEF',
            'domaine_connaissances' => 'Education et formation',
            'evaluation' => null,
            'etablissement' => 'Ecole Supérieure de l\'Education et de la Formation',
            'etablissement_2' => 'Ecole Supérieure de l\'Education et de la Formation',
            'ville' => 'Beni-Mellal ',
            'universite' => 'Université Sultan Moulay Slimane béni mellal',
        ]);

        Etablissement::create([
            'acronyme' => 'ENSA',
            'domaine_connaissances' => 'Sciences appliquées',
            'evaluation' => null,
            'etablissement' => 'Ecoles d\'ingénieurs ',
            'etablissement_2' => 'L\'École Nationale des Sciences Appliquées',
            'ville' => 'Berrechid ',
            'universite' => 'Université Hassan I Settat',
        ]);

        Etablissement::create([
            'acronyme' => 'FEG',
            'domaine_connaissances' => 'sciences juridiques, économiques et sociales',
            'evaluation' => null,
            'etablissement' => 'Faculté d\'Economie et de Gestion',
            'etablissement_2' => 'Faculté d\'Economie et de Gestion',
            'ville' => 'Beni-Mellal ',
            'universite' => 'Université Sultan Moulay Slimane béni mellal',
        ]);

        Etablissement::create([
            'acronyme' => 'FLSH',
            'domaine_connaissances' => 'Lettres et sciences humaines',
            'evaluation' => 'évalué',
            'etablissement' => 'Facultés de Médecine et de Pharmacie',
            'etablissement_2' => 'Facultés de Médecine et de Pharmacie',
            'ville' => 'Beni-Mellal ',
            'universite' => 'Université Sultan Moulay Slimane béni mellal',
        ]);

        Etablissement::create([
            'acronyme' => 'FST',
            'domaine_connaissances' => 'Sciences et techniques',
            'evaluation' => 'évalué',
            'etablissement' => 'Facultés des Sciences et Techniques ',
            'etablissement_2' => 'Facultés des Sciences et Techniques ',
            'ville' => 'Beni-Mellal ',
            'universite' => 'Université Sultan Moulay Slimane béni mellal',
        ]);

        Etablissement::create([
            'acronyme' => 'FP',
            'domaine_connaissances' => 'Polydesciplinaire',
            'evaluation' => null,
            'etablissement' => 'Faculté Polydisciplinaire ',
            'etablissement_2' => 'Faculté Polydisciplinaire ',
            'ville' => 'Beni-Mellal ',
            'universite' => 'Université Sultan Moulay Slimane béni mellal',
        ]);

        Etablissement::create([
            'acronyme' => 'FP',
            'domaine_connaissances' => 'Polydesciplinaire',
            'evaluation' => null,
            'etablissement' => 'Faculté Polydisciplinaire ',
            'etablissement_2' => 'Faculté Polydisciplinaire ',
            'ville' => 'Khouribga',
            'universite' => 'Université Sultan Moulay Slimane béni mellal',
        ]);

        Etablissement::create([
            'acronyme' => 'FMP',
            'domaine_connaissances' => 'Medecine et pharmacie',
            'evaluation' => null,
            'etablissement' => 'Facultés de Médecine et de Pharmacie',
            'etablissement_2' => 'Facultés de Médecine et de Pharmacie',
            'ville' => 'Beni-Mellal ',
            'universite' => 'Université Sultan Moulay Slimane béni mellal',
        ]);

        Etablissement::create([
            'acronyme' => 'ENCG',
            'domaine_connaissances' => 'Commerce et gestion',
            'evaluation' => null,
            'etablissement' => 'Ecoles Nationales de Commerce et de Gestion',
            'etablissement_2' => 'Ecoles Nationales de Commerce et de Gestion',
            'ville' => 'Marrakesh',
            'universite' => 'l\'Université Cadi Ayyad Marrakesh',
        ]);

        Etablissement::create([
            'acronyme' => 'ENSA',
            'domaine_connaissances' => 'Sciences appliquées',
            'evaluation' => null,
            'etablissement' => 'Ecoles d\'ingénieurs ',
            'etablissement_2' => 'L\'École Nationale des Sciences Appliquées',
            'ville' => 'Beni-Mellal ',
            'universite' => 'Université Sultan Moulay Slimane béni mellal',
        ]);

        Etablissement::create([
            'acronyme' => 'ENSA',
            'domaine_connaissances' => 'Sciences appliquées',
            'evaluation' => null,
            'etablissement' => 'Ecoles d\'ingénieurs ',
            'etablissement_2' => 'L\'École Nationale des Sciences Appliquées',
            'ville' => 'Khouribga',
            'universite' => 'Université Sultan Moulay Slimane béni mellal',
        ]);

        Etablissement::create([
            'acronyme' => 'ENSA',
            'domaine_connaissances' => 'Sciences appliquées',
            'evaluation' => null,
            'etablissement' => 'Ecoles d\'ingénieurs ',
            'etablissement_2' => 'L\'École Nationale des Sciences Appliquées',
            'ville' => 'Safi',
            'universite' => 'l\'Université Cadi Ayyad Marrakesh',
        ]);

        Etablissement::create([
            'acronyme' => 'ENS',
            'domaine_connaissances' => 'Education et formation',
            'evaluation' => null,
            'etablissement' => 'École Normale Supérieure',
            'etablissement_2' => 'École Normale Supérieure',
            'ville' => 'Marrakesh',
            'universite' => 'l\'Université Cadi Ayyad Marrakesh',
        ]);

        Etablissement::create([
            'acronyme' => 'ENSA',
            'domaine_connaissances' => 'Sciences appliquées',
            'evaluation' => null,
            'etablissement' => 'Ecoles d\'ingénieurs ',
            'etablissement_2' => 'L\'École Nationale des Sciences Appliquées',
            'ville' => 'Marrakesh',
            'universite' => 'l\'Université Cadi Ayyad Marrakesh',
        ]);

        Etablissement::create([
            'acronyme' => 'ENSA',
            'domaine_connaissances' => 'Sciences appliquées',
            'evaluation' => null,
            'etablissement' => 'Ecoles d\'ingénieurs ',
            'etablissement_2' => 'L\'École Nationale des Sciences Appliquées',
            'ville' => 'Fes',
            'universite' => 'Université Sidi Mohamed Ben Abdellah Fès ',
        ]);

        Etablissement::create([
            'acronyme' => 'FLA',
            'domaine_connaissances' => 'Langues',
            'evaluation' => null,
            'etablissement' => 'Faculté de Langue Arabe',
            'etablissement_2' => 'Faculté de Langue Arabe',
            'ville' => 'Marrakesh',
            'universite' => 'l\'Université Cadi Ayyad Marrakesh',
        ]);

        Etablissement::create([
            'acronyme' => 'FLSH',
            'domaine_connaissances' => 'Lettres et sciences humaines',
            'evaluation' => null,
            'etablissement' => 'Facultés de Médecine et de Pharmacie',
            'etablissement_2' => 'Facultés de Médecine et de Pharmacie',
            'ville' => 'Marrakesh',
            'universite' => 'l\'Université Cadi Ayyad Marrakesh',
        ]);

        Etablissement::create([
            'acronyme' => 'FMP',
            'domaine_connaissances' => 'Medecine et pharmacie',
            'evaluation' => null,
            'etablissement' => 'Facultés de Médecine et de Pharmacie',
            'etablissement_2' => 'Facultés de Médecine et de Pharmacie',
            'ville' => 'Marrakesh',
            'universite' => 'l\'Université Cadi Ayyad Marrakesh',
        ]);

        Etablissement::create([
            'acronyme' => 'ENSA',
            'domaine_connaissances' => 'Sciences appliquées',
            'evaluation' => null,
            'etablissement' => 'Ecoles d\'ingénieurs ',
            'etablissement_2' => 'L\'École Nationale des Sciences Appliquées',
            'ville' => 'Al Hoceima ',
            'universite' => 'Université Abdelmalek Essaâdi Tétouan',
        ]);

        Etablissement::create([
            'acronyme' => 'ENSA',
            'domaine_connaissances' => 'Sciences appliquées',
            'evaluation' => null,
            'etablissement' => 'Ecoles d\'ingénieurs ',
            'etablissement_2' => 'L\'École Nationale des Sciences Appliquées',
            'ville' => 'Tetouan',
            'universite' => 'Université Abdelmalek Essaâdi Tétouan',
        ]);

        Etablissement::create([
            'acronyme' => 'FP',
            'domaine_connaissances' => 'Polydesciplinaire',
            'evaluation' => 'évalué_a',
            'etablissement' => 'Faculté Polydisciplinaire ',
            'etablissement_2' => 'Faculté Polydisciplinaire ',
            'ville' => 'Safi',
            'universite' => 'l\'Université Cadi Ayyad Marrakesh',
        ]);

        Etablissement::create([
            'acronyme' => 'FSJES',
            'domaine_connaissances' => 'sciences juridiques, économiques et sociales',
            'evaluation' => null,
            'etablissement' => 'Faculté des Sciences Juridiques Economiques et Sociales',
            'etablissement_2' => 'Faculté des Sciences Juridiques Economiques et Sociales',
            'ville' => 'Marrakesh',
            'universite' => 'l\'Université Cadi Ayyad Marrakesh',
        ]);

        Etablissement::create([
            'acronyme' => 'FSJES',
            'domaine_connaissances' => 'sciences juridiques, économiques et sociales',
            'evaluation' => 'évalué_a',
            'etablissement' => 'Faculté des Sciences Juridiques Economiques et Sociales',
            'etablissement_2' => 'Faculté des Sciences Juridiques Economiques et Sociales',
            'ville' => 'El Kelaa des Sraghna ',
            'universite' => 'l\'Université Cadi Ayyad Marrakesh',
        ]);

        Etablissement::create([
            'acronyme' => 'ENCG',
            'domaine_connaissances' => 'Commerce et gestion',
            'evaluation' => null,
            'etablissement' => 'Ecoles Nationales de Commerce et de Gestion',
            'etablissement_2' => 'Ecoles Nationales de Commerce et de Gestion',
            'ville' => 'Fes',
            'universite' => 'Université Sidi Mohamed Ben Abdellah Fès ',
        ]);

        Etablissement::create([
            'acronyme' => 'ENSA',
            'domaine_connaissances' => 'Sciences appliquées',
            'evaluation' => null,
            'etablissement' => 'Ecoles d\'ingénieurs ',
            'etablissement_2' => 'L\'École Nationale des Sciences Appliquées',
            'ville' => 'Tangier',
            'universite' => 'Université Abdelmalek Essaâdi Tétouan',
        ]);

        Etablissement::create([
            'acronyme' => 'ENS',
            'domaine_connaissances' => 'Education et formation',
            'evaluation' => null,
            'etablissement' => 'École Normale Supérieure',
            'etablissement_2' => 'École Normale Supérieure',
            'ville' => 'Fes',
            'universite' => 'Université Sidi Mohamed Ben Abdellah Fès ',
        ]);

        Etablissement::create([
            'acronyme' => 'ENSA',
            'domaine_connaissances' => 'Sciences appliquées',
            'evaluation' => null,
            'etablissement' => 'Ecoles d\'ingénieurs ',
            'etablissement_2' => 'L\'École Nationale des Sciences Appliquées',
            'ville' => 'Oujda',
            'universite' => 'Université Mohammed Premier Oujda',
        ]);

        Etablissement::create([
            'acronyme' => 'FC',
            'domaine_connaissances' => 'Etudes islamiques',
            'evaluation' => null,
            'etablissement' => 'Faculté Chariaa',
            'etablissement_2' => 'Faculté Chariaa Fes',
            'ville' => 'Fes',
            'universite' => 'Université Sidi Mohamed Ben Abdellah Fès ',
        ]);

        Etablissement::create([
            'acronyme' => 'FLSH',
            'domaine_connaissances' => 'Lettres et sciences humaines',
            'evaluation' => null,
            'etablissement' => 'Facultés de Médecine et de Pharmacie',
            'etablissement_2' => 'Facultés de Médecine et de Pharmacie ــ سايس',
            'ville' => 'Fes',
            'universite' => 'Université Sidi Mohamed Ben Abdellah Fès ',
        ]);

        Etablissement::create([
            'acronyme' => 'FLSH',
            'domaine_connaissances' => 'Lettres et sciences humaines',
            'evaluation' => null,
            'etablissement' => 'Facultés de Médecine et de Pharmacie',
            'etablissement_2' => 'Facultés de Médecine et de Pharmacie Dhar El Mehraz',
            'ville' => 'Fes',
            'universite' => 'Université Sidi Mohamed Ben Abdellah Fès ',
        ]);

        Etablissement::create([
            'acronyme' => 'FMP',
            'domaine_connaissances' => 'Medecine et pharmacie',
            'evaluation' => 'évalué',
            'etablissement' => 'Facultés de Médecine et de Pharmacie',
            'etablissement_2' => 'Facultés de Médecine et de Pharmacie',
            'ville' => 'Fes',
            'universite' => 'Université Sidi Mohamed Ben Abdellah Fès ',
        ]);

        Etablissement::create([
            'acronyme' => 'FS',
            'domaine_connaissances' => 'Sciences',
            'evaluation' => null,
            'etablissement' => 'Faculté des sciences',
            'etablissement_2' => 'Faculté des sciences',
            'ville' => 'Agadir',
            'universite' => 'Université Ibn Zohr Agadir',
        ]);

        Etablissement::create([
            'acronyme' => 'FS',
            'domaine_connaissances' => 'Sciences',
            'evaluation' => null,
            'etablissement' => 'Faculté des sciences',
            'etablissement_2' => 'Faculté des sciences',
            'ville' => 'El Jadida ',
            'universite' => 'Université Chouaib Doukkali El Jadida',
        ]);

        Etablissement::create([
            'acronyme' => 'ISS',
            'domaine_connaissances' => 'Sport',
            'evaluation' => null,
            'etablissement' => 'L\'Institut des Sciences du Sport',
            'etablissement_2' => 'L\'Institut des Sciences du Sport',
            'ville' => 'Fes',
            'universite' => 'Université Sidi Mohamed Ben Abdellah Fès ',
        ]);

        Etablissement::create([
            'acronyme' => 'FP',
            'domaine_connaissances' => 'Polydesciplinaire',
            'evaluation' => 'évalué_a',
            'etablissement' => 'Faculté Polydisciplinaire ',
            'etablissement_2' => 'Faculté Polydisciplinaire ',
            'ville' => 'Taza',
            'universite' => 'Université Sidi Mohamed Ben Abdellah Fès ',
        ]);

        Etablissement::create([
            'acronyme' => 'FSJES',
            'domaine_connaissances' => 'sciences juridiques, économiques et sociales',
            'evaluation' => null,
            'etablissement' => 'Faculté des Sciences Juridiques Economiques et Sociales',
            'etablissement_2' => 'Faculté des Sciences Juridiques Economiques et Sociales',
            'ville' => 'Fes',
            'universite' => 'Université Sidi Mohamed Ben Abdellah Fès ',
        ]);

        Etablissement::create([
            'acronyme' => 'ENCG',
            'domaine_connaissances' => 'Commerce et gestion',
            'evaluation' => 'évalué',
            'etablissement' => 'Ecoles Nationales de Commerce et de Gestion',
            'etablissement_2' => 'Ecoles Nationales de Commerce et de Gestion',
            'ville' => 'El Jadida ',
            'universite' => 'Université Chouaib Doukkali El Jadida',
        ]);

        Etablissement::create([
            'acronyme' => 'FS',
            'domaine_connaissances' => 'Sciences',
            'evaluation' => null,
            'etablissement' => 'Faculté des sciences',
            'etablissement_2' => 'Faculté des sciences',
            'ville' => 'Tetouan',
            'universite' => 'Université Abdelmalek Essaâdi Tétouan',
        ]);

        Etablissement::create([
            'acronyme' => 'ENSA',
            'domaine_connaissances' => 'Sciences appliquées',
            'evaluation' => 'évalué',
            'etablissement' => 'Ecoles d\'ingénieurs ',
            'etablissement_2' => 'L\'École Nationale des Sciences Appliquées',
            'ville' => 'El Jadida ',
            'universite' => 'Université Chouaib Doukkali El Jadida',
        ]);

        Etablissement::create([
            'acronyme' => 'ESEF',
            'domaine_connaissances' => 'Education et formation',
            'evaluation' => null,
            'etablissement' => 'Ecole Supérieure de l\'Education et de la Formation',
            'etablissement_2' => 'Ecole Supérieure de l\'Education et de la Formation',
            'ville' => 'El Jadida ',
            'universite' => 'Université Chouaib Doukkali El Jadida',
        ]);

        Etablissement::create([
            'acronyme' => 'FP',
            'domaine_connaissances' => 'Polydesciplinaire',
            'evaluation' => null,
            'etablissement' => 'Faculté Polydisciplinaire ',
            'etablissement_2' => 'Faculté Polydisciplinaire ',
            'ville' => 'Sidi Bennour ',
            'universite' => 'Université Chouaib Doukkali El Jadida',
        ]);

        Etablissement::create([
            'acronyme' => 'FLSH',
            'domaine_connaissances' => 'Lettres et sciences humaines',
            'evaluation' => null,
            'etablissement' => 'Facultés de Médecine et de Pharmacie',
            'etablissement_2' => 'Facultés de Médecine et de Pharmacie',
            'ville' => 'El Jadida ',
            'universite' => 'Université Chouaib Doukkali El Jadida',
        ]);

        Etablissement::create([
            'acronyme' => 'FS',
            'domaine_connaissances' => 'Sciences',
            'evaluation' => null,
            'etablissement' => 'Faculté des sciences',
            'etablissement_2' => 'Faculté des sciences',
            'ville' => 'Meknes',
            'universite' => 'Université Moulay Ismaïl Meknès',
        ]);

        Etablissement::create([
            'acronyme' => 'FSJES',
            'domaine_connaissances' => 'sciences juridiques, économiques et sociales',
            'evaluation' => null,
            'etablissement' => 'Faculté des Sciences Juridiques Economiques et Sociales',
            'etablissement_2' => 'Faculté des Sciences Juridiques Economiques et Sociales',
            'ville' => 'El Jadida ',
            'universite' => 'Université Chouaib Doukkali El Jadida',
        ]);

        Etablissement::create([
            'acronyme' => 'ENCG',
            'domaine_connaissances' => 'Commerce et gestion',
            'evaluation' => null,
            'etablissement' => 'Ecoles Nationales de Commerce et de Gestion',
            'etablissement_2' => 'Ecoles Nationales de Commerce et de Gestion',
            'ville' => 'Tangier',
            'universite' => 'Université Abdelmalek Essaâdi Tétouan',
        ]);

        Etablissement::create([
            'acronyme' => 'FP',
            'domaine_connaissances' => 'Polydesciplinaire',
            'evaluation' => null,
            'etablissement' => 'Faculté Polydisciplinaire ',
            'etablissement_2' => 'Faculté Polydisciplinaire ',
            'ville' => 'Ksar el-Kebir',
            'universite' => 'Université Abdelmalek Essaâdi Tétouan',
        ]);

        Etablissement::create([
            'acronyme' => 'FP',
            'domaine_connaissances' => 'Polydesciplinaire',
            'evaluation' => 'évalué',
            'etablissement' => 'Faculté Polydisciplinaire ',
            'etablissement_2' => 'Faculté Polydisciplinaire ',
            'ville' => 'Larache',
            'universite' => 'Université Abdelmalek Essaâdi Tétouan',
        ]);

        Etablissement::create([
            'acronyme' => 'ENS',
            'domaine_connaissances' => 'Education et formation',
            'evaluation' => null,
            'etablissement' => 'École Normale Supérieure',
            'etablissement_2' => 'École Normale Supérieure',
            'ville' => 'Tetouan',
            'universite' => 'Université Abdelmalek Essaâdi Tétouan',
        ]);

        Etablissement::create([
            'acronyme' => 'FS',
            'domaine_connaissances' => 'Sciences',
            'evaluation' => null,
            'etablissement' => 'Faculté des sciences',
            'etablissement_2' => 'Faculté des Sciences Dhar El Mahraz ',
            'ville' => 'Fes',
            'universite' => 'Université Sidi Mohamed Ben Abdellah Fès ',
        ]);

        Etablissement::create([
            'acronyme' => 'FS',
            'domaine_connaissances' => 'Sciences',
            'evaluation' => null,
            'etablissement' => 'Faculté des sciences',
            'etablissement_2' => 'Faculté des sciences aïn chock ',
            'ville' => 'Casablanca',
            'universite' => 'Université Hassan 2 de Casablanca',
        ]);

        Etablissement::create([
            'acronyme' => 'FSA',
            'domaine_connaissances' => 'Sciences',
            'evaluation' => null,
            'etablissement' => 'Faculté des Sciences Appliquées',
            'etablissement_2' => 'Faculté des Sciences Appliquées',
            'ville' => 'Ait Melloul ',
            'universite' => 'Université Ibn Zohr Agadir',
        ]);

        Etablissement::create([
            'acronyme' => 'ESRFT',
            'domaine_connaissances' => 'Traduction',
            'evaluation' => null,
            'etablissement' => 'Ecole Supérieure Roi Fahd de Traduction',
            'etablissement_2' => 'Ecole Supérieure Roi Fahd de Traduction',
            'ville' => 'Tangier',
            'universite' => 'Université Abdelmalek Essaâdi Tétouan',
        ]);

        Etablissement::create([
            'acronyme' => 'FLSH',
            'domaine_connaissances' => 'Lettres et sciences humaines',
            'evaluation' => null,
            'etablissement' => 'Facultés de Médecine et de Pharmacie',
            'etablissement_2' => 'Facultés de Médecine et de Pharmacie',
            'ville' => 'Tetouan',
            'universite' => 'Université Abdelmalek Essaâdi Tétouan',
        ]);

        Etablissement::create([
            'acronyme' => 'FMP',
            'domaine_connaissances' => 'Medecine et pharmacie',
            'evaluation' => null,
            'etablissement' => 'Facultés de Médecine et de Pharmacie',
            'etablissement_2' => 'Facultés de Médecine et de Pharmacie',
            'ville' => 'Tangier',
            'universite' => 'Université Abdelmalek Essaâdi Tétouan',
        ]);

        Etablissement::create([
            'acronyme' => 'FOD',
            'domaine_connaissances' => 'Etudes islamiques',
            'evaluation' => null,
            'etablissement' => 'Faculté des Fondements de la Religion Tetouan',
            'etablissement_2' => 'Faculté des Fondements de la Religion',
            'ville' => 'Tetouan',
            'universite' => 'Université Abdelmalek Essaâdi Tétouan',
        ]);

        Etablissement::create([
            'acronyme' => 'FS',
            'domaine_connaissances' => 'Sciences',
            'evaluation' => null,
            'etablissement' => 'Faculté des sciences',
            'etablissement_2' => 'Faculté des Sciences Semlalia',
            'ville' => 'Marrakesh',
            'universite' => 'l\'Université Cadi Ayyad Marrakesh',
        ]);

        Etablissement::create([
            'acronyme' => 'FST',
            'domaine_connaissances' => 'Sciences et techniques',
            'evaluation' => 'évalué',
            'etablissement' => 'Facultés des Sciences et Techniques ',
            'etablissement_2' => 'Facultés des Sciences et Techniques ',
            'ville' => 'Al Hoceima ',
            'universite' => 'Université Abdelmalek Essaâdi Tétouan',
        ]);

        Etablissement::create([
            'acronyme' => 'FST',
            'domaine_connaissances' => 'Sciences et techniques',
            'evaluation' => null,
            'etablissement' => 'Facultés des Sciences et Techniques ',
            'etablissement_2' => 'Facultés des Sciences et Techniques ',
            'ville' => 'Settat',
            'universite' => 'Université Hassan I Settat',
        ]);

        Etablissement::create([
            'acronyme' => 'FSJES',
            'domaine_connaissances' => 'sciences juridiques, économiques et sociales',
            'evaluation' => null,
            'etablissement' => 'Faculté des Sciences Juridiques Economiques et Sociales',
            'etablissement_2' => 'Faculté des Sciences Juridiques Economiques et Sociales',
            'ville' => 'Tangier',
            'universite' => 'Université Abdelmalek Essaâdi Tétouan',
        ]);

        Etablissement::create([
            'acronyme' => 'FSJES',
            'domaine_connaissances' => 'sciences juridiques, économiques et sociales',
            'evaluation' => null,
            'etablissement' => 'Faculté des Sciences Juridiques Economiques et Sociales',
            'etablissement_2' => 'Faculté des Sciences Juridiques Economiques et Sociales',
            'ville' => 'Tetouan',
            'universite' => 'Université Abdelmalek Essaâdi Tétouan',
        ]);

        Etablissement::create([
            'acronyme' => 'ENCG',
            'domaine_connaissances' => 'Commerce et gestion',
            'evaluation' => null,
            'etablissement' => 'Ecoles Nationales de Commerce et de Gestion',
            'etablissement_2' => 'Ecoles Nationales de Commerce et de Gestion',
            'ville' => 'Oujda',
            'universite' => 'Université Mohammed Premier Oujda',
        ]);

        Etablissement::create([
            'acronyme' => 'EST',
            'domaine_connaissances' => 'Technologie',
            'evaluation' => 'évalué',
            'etablissement' => 'Écoles supérieures de technologie',
            'etablissement_2' => 'Écoles supérieures de technologie',
            'ville' => 'Oujda',
            'universite' => 'Université Mohammed Premier Oujda',
        ]);

        Etablissement::create([
            'acronyme' => 'FST',
            'domaine_connaissances' => 'Sciences et techniques',
            'evaluation' => null,
            'etablissement' => 'Facultés des Sciences et Techniques ',
            'etablissement_2' => 'Facultés des Sciences et Techniques ',
            'ville' => 'Mohammedia',
            'universite' => 'Université Hassan 2 de Casablanca',
        ]);

        Etablissement::create([
            'acronyme' => 'FP',
            'domaine_connaissances' => 'Polydesciplinaire',
            'evaluation' => 'évalué_a',
            'etablissement' => 'Faculté Polydisciplinaire ',
            'etablissement_2' => 'Faculté Polydisciplinaire ',
            'ville' => 'Nador',
            'universite' => 'Université Mohammed Premier Oujda',
        ]);

        Etablissement::create([
            'acronyme' => 'FST',
            'domaine_connaissances' => 'Sciences et techniques',
            'evaluation' => null,
            'etablissement' => 'Facultés des Sciences et Techniques ',
            'etablissement_2' => 'Facultés des Sciences et Techniques ',
            'ville' => 'Fes',
            'universite' => 'Université Sidi Mohamed Ben Abdellah Fès ',
        ]);

        Etablissement::create([
            'acronyme' => 'ESEF',
            'domaine_connaissances' => 'Education et formation',
            'evaluation' => null,
            'etablissement' => 'Ecole Supérieure de l\'Education et de la Formation',
            'etablissement_2' => 'Ecole Supérieure de l\'Education et de la Formation',
            'ville' => 'Oujda',
            'universite' => 'Université Mohammed Premier Oujda',
        ]);

        Etablissement::create([
            'acronyme' => 'FLSH',
            'domaine_connaissances' => 'Lettres et sciences humaines',
            'evaluation' => null,
            'etablissement' => 'Facultés de Médecine et de Pharmacie',
            'etablissement_2' => 'Facultés de Médecine et de Pharmacie',
            'ville' => 'Oujda',
            'universite' => 'Université Mohammed Premier Oujda',
        ]);

        Etablissement::create([
            'acronyme' => 'FMP',
            'domaine_connaissances' => 'Medecine et pharmacie',
            'evaluation' => null,
            'etablissement' => 'Facultés de Médecine et de Pharmacie',
            'etablissement_2' => 'Facultés de Médecine et de Pharmacie',
            'ville' => 'Oujda',
            'universite' => 'Université Mohammed Premier Oujda',
        ]);

        Etablissement::create([
            'acronyme' => 'FS',
            'domaine_connaissances' => 'Sciences',
            'evaluation' => 'évalué',
            'etablissement' => 'Faculté des sciences',
            'etablissement_2' => 'Faculté des sciences',
            'ville' => 'Oujda',
            'universite' => 'Université Mohammed Premier Oujda',
        ]);

        Etablissement::create([
            'acronyme' => 'FSJES',
            'domaine_connaissances' => 'sciences juridiques, économiques et sociales',
            'evaluation' => null,
            'etablissement' => 'Faculté des Sciences Juridiques Economiques et Sociales',
            'etablissement_2' => 'Faculté des Sciences Juridiques Economiques et Sociales',
            'ville' => 'Oujda',
            'universite' => 'Université Mohammed Premier Oujda',
        ]);

        Etablissement::create([
            'acronyme' => 'EST',
            'domaine_connaissances' => 'Technologie',
            'evaluation' => 'évalué',
            'etablissement' => 'Écoles supérieures de technologie',
            'etablissement_2' => 'Écoles supérieures de technologie',
            'ville' => 'Salé',
            'universite' => 'l\'Université Mohammed V de Rabat',
        ]);

        Etablissement::create([
            'acronyme' => 'EMI',
            'domaine_connaissances' => 'Ingénierie',
            'evaluation' => null,
            'etablissement' => 'Ecoles d\'ingénieurs ',
            'etablissement_2' => 'École Mohammadia d\'ingénieurs ',
            'ville' => 'Rabat',
            'universite' => 'l\'Université Mohammed V de Rabat',
        ]);

        Etablissement::create([
            'acronyme' => 'ENS',
            'domaine_connaissances' => 'Education et formation',
            'evaluation' => null,
            'etablissement' => 'École Normale Supérieure',
            'etablissement_2' => 'École Normale Supérieure',
            'ville' => 'Rabat',
            'universite' => 'l\'Université Mohammed V de Rabat',
        ]);

        Etablissement::create([
            'acronyme' => 'ENSAM',
            'domaine_connaissances' => 'Ingénierie',
            'evaluation' => null,
            'etablissement' => 'Ecoles d\'ingénieurs ',
            'etablissement_2' => 'Ecoles Nationales Supérieures d\'Arts et Métiers',
            'ville' => 'Rabat',
            'universite' => 'l\'Université Mohammed V de Rabat',
        ]);

        Etablissement::create([
            'acronyme' => 'ENSIAS',
            'domaine_connaissances' => 'Ingénierie',
            'evaluation' => null,
            'etablissement' => 'Ecoles d\'ingénieurs ',
            'etablissement_2' => 'l\'École Nationale Supérieure d\'Informatique et d\'Analyse des Systèmes',
            'ville' => 'Rabat',
            'universite' => 'l\'Université Mohammed V de Rabat',
        ]);

        Etablissement::create([
            'acronyme' => 'FLSH',
            'domaine_connaissances' => 'Lettres et sciences humaines',
            'evaluation' => null,
            'etablissement' => 'Facultés de Médecine et de Pharmacie',
            'etablissement_2' => 'Facultés de Médecine et de Pharmacie',
            'ville' => 'Rabat',
            'universite' => 'l\'Université Mohammed V de Rabat',
        ]);

        Etablissement::create([
            'acronyme' => 'FMD',
            'domaine_connaissances' => 'Médecine dentaire',
            'evaluation' => null,
            'etablissement' => 'Faculté de Médecine Dentaire',
            'etablissement_2' => 'Faculté de Médecine Dentaire',
            'ville' => 'Rabat',
            'universite' => 'l\'Université Mohammed V de Rabat',
        ]);

        Etablissement::create([
            'acronyme' => 'FMP',
            'domaine_connaissances' => 'Medecine et pharmacie',
            'evaluation' => null,
            'etablissement' => 'Facultés de Médecine et de Pharmacie',
            'etablissement_2' => 'Facultés de Médecine et de Pharmacie',
            'ville' => 'Rabat',
            'universite' => 'l\'Université Mohammed V de Rabat',
        ]);

        Etablissement::create([
            'acronyme' => 'FS',
            'domaine_connaissances' => 'Sciences',
            'evaluation' => 'évalué',
            'etablissement' => 'Faculté des sciences',
            'etablissement_2' => 'Faculté des sciences',
            'ville' => 'Rabat',
            'universite' => 'l\'Université Mohammed V de Rabat',
        ]);

        Etablissement::create([
            'acronyme' => 'FSE',
            'domaine_connaissances' => 'Sciences de l\'éducation',
            'evaluation' => null,
            'etablissement' => 'Faculté des Sciences de l\'Education ',
            'etablissement_2' => 'Faculté des Sciences de l\'Education ',
            'ville' => 'Rabat',
            'universite' => 'l\'Université Mohammed V de Rabat',
        ]);

        Etablissement::create([
            'acronyme' => 'IERA',
            'domaine_connaissances' => 'Langues',
            'evaluation' => null,
            'etablissement' => 'L’Institut d’Études et de Recherches pour l’Arabisation',
            'etablissement_2' => 'L’Institut d’Études et de Recherches pour l’Arabisation',
            'ville' => 'Rabat',
            'universite' => 'l\'Université Mohammed V de Rabat',
        ]);

        Etablissement::create([
            'acronyme' => 'IS',
            'domaine_connaissances' => 'Institut',
            'evaluation' => null,
            'etablissement' => 'Institut Scientifique ',
            'etablissement_2' => 'Institut Scientifique ',
            'ville' => 'Rabat',
            'universite' => 'l\'Université Mohammed V de Rabat',
        ]);

        Etablissement::create([
            'acronyme' => 'IUEAEMIA',
            'domaine_connaissances' => 'Institut',
            'evaluation' => null,
            'etablissement' => 'Institut des Etudes Africaines',
            'etablissement_2' => 'Institut des Etudes Africaines',
            'ville' => 'Rabat',
            'universite' => 'l\'Université Mohammed V de Rabat',
        ]);

        Etablissement::create([
            'acronyme' => 'FSJES',
            'domaine_connaissances' => 'sciences juridiques, économiques et sociales',
            'evaluation' => null,
            'etablissement' => 'Faculté des Sciences Juridiques Economiques et Sociales',
            'etablissement_2' => 'Faculté des Sciences Juridiques Economiques et Sociales ــ أكدال',
            'ville' => 'Rabat',
            'universite' => 'l\'Université Mohammed V de Rabat',
        ]);

        Etablissement::create([
            'acronyme' => 'FSJES',
            'domaine_connaissances' => 'sciences juridiques, économiques et sociales',
            'evaluation' => null,
            'etablissement' => 'Faculté des Sciences Juridiques Economiques et Sociales',
            'etablissement_2' => 'Faculté des Sciences Juridiques Economiques et Sociales - السويسي',
            'ville' => 'Rabat',
            'universite' => 'l\'Université Mohammed V de Rabat',
        ]);

        Etablissement::create([
            'acronyme' => 'FSJES',
            'domaine_connaissances' => 'sciences juridiques, économiques et sociales',
            'evaluation' => null,
            'etablissement' => 'Faculté des Sciences Juridiques Economiques et Sociales',
            'etablissement_2' => 'Faculté des Sciences Juridiques Economiques et Sociales ــ Salé',
            'ville' => 'Salé',
            'universite' => 'l\'Université Mohammed V de Rabat',
        ]);

        Etablissement::create([
            'acronyme' => 'ENCG',
            'domaine_connaissances' => 'Commerce et gestion',
            'evaluation' => null,
            'etablissement' => 'Ecoles Nationales de Commerce et de Gestion',
            'etablissement_2' => 'Ecoles Nationales de Commerce et de Gestion',
            'ville' => 'El Hajeb ',
            'universite' => 'Université Moulay Ismaïl Meknès',
        ]);

        Etablissement::create([
            'acronyme' => 'FST',
            'domaine_connaissances' => 'Sciences et techniques',
            'evaluation' => null,
            'etablissement' => 'Facultés des Sciences et Techniques ',
            'etablissement_2' => 'Facultés des Sciences et Techniques ',
            'ville' => 'Tangier',
            'universite' => 'Université Abdelmalek Essaâdi Tétouan',
        ]);

        Etablissement::create([
            'acronyme' => 'FP',
            'domaine_connaissances' => 'Polydesciplinaire',
            'evaluation' => null,
            'etablissement' => 'Faculté Polydisciplinaire ',
            'etablissement_2' => 'Faculté Polydisciplinaire ',
            'ville' => 'Errachidia',
            'universite' => 'Université Moulay Ismaïl Meknès',
        ]);

        Etablissement::create([
            'acronyme' => 'ENS',
            'domaine_connaissances' => 'Education et formation',
            'evaluation' => 'évalué',
            'etablissement' => 'École Normale Supérieure',
            'etablissement_2' => 'École Normale Supérieure',
            'ville' => 'Meknes',
            'universite' => 'Université Moulay Ismaïl Meknès',
        ]);

        Etablissement::create([
            'acronyme' => 'ENSAM',
            'domaine_connaissances' => 'Ingénierie',
            'evaluation' => 'évalué',
            'etablissement' => 'Ecoles d\'ingénieurs ',
            'etablissement_2' => 'Ecoles Nationales Supérieures d\'Arts et Métiers',
            'ville' => 'Meknes',
            'universite' => 'Université Moulay Ismaïl Meknès',
        ]);

        Etablissement::create([
            'acronyme' => 'FLSH',
            'domaine_connaissances' => 'Lettres et sciences humaines',
            'evaluation' => null,
            'etablissement' => 'Facultés de Médecine et de Pharmacie',
            'etablissement_2' => 'Facultés de Médecine et de Pharmacie',
            'ville' => 'Meknes',
            'universite' => 'Université Moulay Ismaïl Meknès',
        ]);

        Etablissement::create([
            'acronyme' => 'FST',
            'domaine_connaissances' => 'Sciences et techniques',
            'evaluation' => null,
            'etablissement' => 'Facultés des Sciences et Techniques ',
            'etablissement_2' => 'Facultés des Sciences et Techniques ',
            'ville' => 'Errachidia',
            'universite' => 'Université Moulay Ismaïl Meknès',
        ]);

        Etablissement::create([
            'acronyme' => 'FSJES',
            'domaine_connaissances' => 'sciences juridiques, économiques et sociales',
            'evaluation' => 'évalué',
            'etablissement' => 'Faculté des Sciences Juridiques Economiques et Sociales',
            'etablissement_2' => 'Faculté des Sciences Juridiques Economiques et Sociales',
            'ville' => 'Meknes',
            'universite' => 'Université Moulay Ismaïl Meknès',
        ]);

        Etablissement::create([
            'acronyme' => 'FST',
            'domaine_connaissances' => 'Sciences et techniques',
            'evaluation' => null,
            'etablissement' => 'Facultés des Sciences et Techniques ',
            'etablissement_2' => 'Facultés des Sciences et Techniques  ',
            'ville' => 'Marrakesh',
            'universite' => 'l\'Université Cadi Ayyad Marrakesh',
        ]);

        Etablissement::create([
            'acronyme' => 'FMP',
            'domaine_connaissances' => 'Medecine et pharmacie',
            'evaluation' => null,
            'etablissement' => 'Facultés de Médecine et de Pharmacie',
            'etablissement_2' => 'Facultés de Médecine et de Pharmacie',
            'ville' => 'Errachidia',
            'universite' => 'Université Moulay Ismaïl Meknès',
        ]);

    }
}