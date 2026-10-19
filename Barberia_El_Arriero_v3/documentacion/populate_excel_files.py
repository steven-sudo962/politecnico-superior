import zipfile, os, shutil
from datetime import datetime, date
import xml.etree.ElementTree as ET

DOC_DIR = r"c:\Users\johan\OneDrive\Desktop\Barberia_El_Arriero_v3\documentacion"
CRON_PATH = os.path.join(DOC_DIR, "Cronograma_Actividades_Barberia_El_Arriero.xlsx")
BITA_PATH = os.path.join(DOC_DIR, "Bitacora_Seguimiento_Barberia_El_Arriero.xlsx")

def excel_date(d_str):
    dt = datetime.strptime(d_str, '%Y-%m-%d').date()
    return (dt - date(1899, 12, 30)).days

# ==========================================
# 1. ACTUALIZAR CRONOGRAMA DE ACTIVIDADES
# ==========================================
def update_cronograma():
    tmp_dir = os.path.join(DOC_DIR, "tmp_cron")
    if os.path.exists(tmp_dir): shutil.rmtree(tmp_dir)
    os.makedirs(tmp_dir)

    with zipfile.ZipFile(CRON_PATH, 'r') as z:
        z.extractall(tmp_dir)

    # 1. Leer sharedStrings existentes y armar lista
    ss_path = os.path.join(tmp_dir, 'xl', 'sharedStrings.xml')
    tree_ss = ET.parse(ss_path)
    root_ss = tree_ss.getroot()
    ns_ss = {'m': 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}
    
    strings_list = []
    for si in root_ss.findall('m:si', ns_ss):
        t = si.find('m:t', ns_ss)
        strings_list.append(t.text if t is not None else '')

    def get_or_add_str(text):
        if text in strings_list:
            return strings_list.index(text)
        strings_list.append(text)
        si_elem = ET.Element('{http://schemas.openxmlformats.org/spreadsheetml/2006/main}si')
        t_elem = ET.SubElement(si_elem, '{http://schemas.openxmlformats.org/spreadsheetml/2006/main}t')
        t_elem.text = text
        root_ss.append(si_elem)
        return len(strings_list) - 1

    # Datos del cronograma de Barbería
    tasks_data = [
        # (Row, TaskName, SubtaskName, Status, AssignedTo, StartDate, EndDate)
        (3, "FASE 1: Levantamiento y Primer Prototipo", "", "Completo", "Johan Ibarra", "2026-08-02", "2026-08-15"),
        (4, "", "1.1 Entrevista y catalogo de precios", "Completo", "Johan Ibarra", "2026-08-02", "2026-08-06"),
        (5, "", "1.2 Arquitectura HTML5 y paleta cafetera", "Completo", "Johan Ibarra", "2026-08-07", "2026-08-10"),
        (6, "", "1.3 Prototipo v1 (Barberia El Arriero)", "Completo", "Johan Ibarra", "2026-08-11", "2026-08-15"),
        (7, "FASE 2: Exploracion de Plantillas Externas", "", "Completo", "Johan Ibarra", "2026-08-16", "2026-08-31"),
        (8, "", "2.1 Pruebas con plantilla Kronos", "Completo", "Johan Ibarra", "2026-08-16", "2026-08-21"),
        (9, "", "2.2 Deteccion de rigidez y descarte", "Completo", "Johan Ibarra", "2026-08-22", "2026-08-25"),
        (10, "", "2.3 Desarrollo Version 2 extendida", "Completo", "Johan Ibarra", "2026-08-26", "2026-08-31"),
        (11, "FASE 3: Sobreingenieria Full-Stack con IA", "", "Completo", "Johan Ibarra", "2026-09-01", "2026-09-25"),
        (12, "", "3.1 Setup React 19 + TypeScript + Vite", "Completo", "Johan Ibarra", "2026-09-01", "2026-09-08"),
        (13, "", "3.2 Servidor Express backend REST", "Completo", "Johan Ibarra", "2026-09-09", "2026-09-16"),
        (14, "", "3.3 Integracion Gemini AI SDK", "Completo", "Johan Ibarra", "2026-09-17", "2026-09-22"),
        (15, "", "3.4 Auditoria de costos y sobreingenieria", "Completo", "Johan Ibarra", "2026-09-23", "2026-09-25"),
        (16, "FASE 4: Simplificacion Frontend", "", "Completo", "Johan Ibarra", "2026-09-26", "2026-10-08"),
        (17, "", "4.1 Retiro de Express (v5_simplificado)", "Completo", "Johan Ibarra", "2026-09-26", "2026-10-02"),
        (18, "", "4.2 Evaluacion friccion Node en cliente", "Completo", "Johan Ibarra", "2026-10-03", "2026-10-06"),
        (19, "", "4.3 Decision de retorno a Vanilla puro", "Completo", "Johan Ibarra", "2026-10-07", "2026-10-08"),
        (20, "FASE 5: Consolidacion Definitiva (v3)", "", "Completo", "Johan Ibarra", "2026-10-09", "2026-10-19"),
        (21, "", "5.1 Estructuracion Vanilla con config.js", "Completo", "Johan Ibarra", "2026-10-09", "2026-10-13"),
        (22, "", "5.2 Algoritmo acumulativo de turnos", "Completo", "Johan Ibarra", "2026-10-14", "2026-10-16"),
        (23, "", "5.3 Seguridad CSP, Honeypot y A11y", "Completo", "Johan Ibarra", "2026-10-17", "2026-10-18"),
        (24, "", "5.4 Sincronizacion Git y Despliegue", "Completo", "Johan Ibarra", "2026-10-19", "2026-10-19")
    ]

    sheet_path = os.path.join(tmp_dir, 'xl', 'worksheets', 'sheet1.xml')
    tree_s = ET.parse(sheet_path)
    root_s = tree_s.getroot()
    ns_s = {'m': 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}
    sheet_data = root_s.find('m:sheetData', ns_s)

    # Actualizar título B1
    idx_title = get_or_add_str("CRONOGRAMA DE ACTIVIDADES - BARBERIA EL ARRIERO ILUSTRADO")
    for c in sheet_data.findall('.//m:c', ns_s):
        if c.attrib.get('r') == 'B1':
            c.attrib['t'] = 's'
            v = c.find('m:v', ns_s)
            if v is not None: v.text = str(idx_title)

    row_map = {int(r.attrib.get('r')): r for r in sheet_data.findall('m:row', ns_s)}

    for r_num, t_name, sub_name, status, assigned, s_date, e_date in tasks_data:
        if r_num not in row_map:
            row_elem = ET.SubElement(sheet_data, '{http://schemas.openxmlformats.org/spreadsheetml/2006/main}row', {'r': str(r_num)})
            row_map[r_num] = row_elem
        else:
            row_elem = row_map[r_num]

        cell_map = {c.attrib.get('r'): c for c in row_elem.findall('m:c', ns_s)}

        def set_cell(col, val, is_str=True):
            ref = f"{col}{r_num}"
            if ref not in cell_map:
                c = ET.SubElement(row_elem, '{http://schemas.openxmlformats.org/spreadsheetml/2006/main}c', {'r': ref})
                cell_map[ref] = c
            else:
                c = cell_map[ref]

            v = c.find('m:v', ns_s)
            if v is None:
                v = ET.SubElement(c, '{http://schemas.openxmlformats.org/spreadsheetml/2006/main}v')

            if is_str:
                c.attrib['t'] = 's'
                v.text = str(get_or_add_str(val))
            else:
                if 't' in c.attrib: del c.attrib['t']
                v.text = str(val)

        # C: Tarea, D: Subtarea, E: Estado, F: Asignada a, G: Inicio, H: Fin, I: Duración
        set_cell('C', t_name)
        set_cell('D', sub_name)
        set_cell('E', status)
        set_cell('F', assigned)
        
        s_ser = excel_date(s_date)
        e_ser = excel_date(e_date)
        dur = max(1, e_ser - s_ser + 1)
        set_cell('G', s_ser, is_str=False)
        set_cell('H', e_ser, is_str=False)
        set_cell('I', dur, is_str=False)

    # Actualizar count en sharedStrings
    root_ss.attrib['count'] = str(len(strings_list))
    root_ss.attrib['uniqueCount'] = str(len(strings_list))

    tree_ss.write(ss_path, encoding='utf-8', xml_declaration=True)
    tree_s.write(sheet_path, encoding='utf-8', xml_declaration=True)

    # Re-empaquetar
    with zipfile.ZipFile(CRON_PATH, 'w', zipfile.ZIP_DEFLATED) as z_out:
        for root, dirs, files in os.walk(tmp_dir):
            for file in files:
                full_p = os.path.join(root, file)
                rel_p = os.path.relpath(full_p, tmp_dir)
                z_out.write(full_p, rel_p)

    shutil.rmtree(tmp_dir)
    print("Cronograma XLSX actualizado exitosamente.")

# ==========================================
# 2. ACTUALIZAR BITÁCORA DE SEGUIMIENTO
# ==========================================
def update_bitacora():
    tmp_dir = os.path.join(DOC_DIR, "tmp_bita")
    if os.path.exists(tmp_dir): shutil.rmtree(tmp_dir)
    os.makedirs(tmp_dir)

    with zipfile.ZipFile(BITA_PATH, 'r') as z:
        z.extractall(tmp_dir)

    ss_path = os.path.join(tmp_dir, 'xl', 'sharedStrings.xml')
    tree_ss = ET.parse(ss_path)
    root_ss = tree_ss.getroot()
    ns_ss = {'m': 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}

    strings_list = []
    for si in root_ss.findall('m:si', ns_ss):
        t = si.find('m:t', ns_ss)
        strings_list.append(t.text if t is not None else '')

    def get_or_add_str(text):
        if text in strings_list:
            return strings_list.index(text)
        strings_list.append(text)
        si_elem = ET.Element('{http://schemas.openxmlformats.org/spreadsheetml/2006/main}si')
        t_elem = ET.SubElement(si_elem, '{http://schemas.openxmlformats.org/spreadsheetml/2006/main}t')
        t_elem.text = text
        root_ss.append(si_elem)
        return len(strings_list) - 1

    sheet_path = os.path.join(tmp_dir, 'xl', 'worksheets', 'sheet1.xml')
    tree_s = ET.parse(sheet_path)
    root_s = tree_s.getroot()
    ns_s = {'m': 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}
    sheet_data = root_s.find('m:sheetData', ns_s)

    row_map = {int(r.attrib.get('r')): r for r in sheet_data.findall('m:row', ns_s)}

    def update_cell_text(ref, text):
        # find cell
        for r in sheet_data.findall('m:row', ns_s):
            for c in r.findall('m:c', ns_s):
                if c.attrib.get('r') == ref:
                    c.attrib['t'] = 's'
                    v = c.find('m:v', ns_s)
                    if v is None: v = ET.SubElement(c, '{http://schemas.openxmlformats.org/spreadsheetml/2006/main}v')
                    v.text = str(get_or_add_str(text))
                    return

    def update_cell_val(ref, num_val):
        for r in sheet_data.findall('m:row', ns_s):
            for c in r.findall('m:c', ns_s):
                if c.attrib.get('r') == ref:
                    if 't' in c.attrib: del c.attrib['t']
                    v = c.find('m:v', ns_s)
                    if v is None: v = ET.SubElement(c, '{http://schemas.openxmlformats.org/spreadsheetml/2006/main}v')
                    v.text = str(num_val)
                    return

    # Cabeceras institucionales
    update_cell_text('B5', 'REGIONAL VALLE DEL CAUCA')
    update_cell_text('B6', 'Centro de Tecnologias de Informacion / Politecnico')
    update_cell_text('B10', 'Barberia El Arriero Ilustrado')
    update_cell_text('M10', '1.144.123.456-7')
    update_cell_text('P10', '1 al 6 (Consolidada)')
    update_cell_text('T10', '02/08/2026 a 19/10/2026')
    update_cell_text('B13', 'Propietario / Maestro Barbero El Arriero')
    update_cell_text('K13', '3128787128')
    update_cell_text('Q13', 'el-arriero-barberia@gmail.com')
    update_cell_text('B20', 'Johan Steven Ibarra Angulo')
    update_cell_text('J20', '1.144.123.456')
    update_cell_text('O20', '3128787128')
    update_cell_text('T20', 'stevenangulo911@gmail.com')
    update_cell_text('B23', 'Segundo Semestre (2°)')
    update_cell_text('K23', 'Ingenieria de Sistemas - Desarrollo y Refinamiento de Software')

    # Actividades en filas 26 y 28
    update_cell_text('B26', 'Investigacion, levantamiento de tarifas y desarrollo de prototipos (v1, Kronos, v2, React v3.1, v5 y v3 final)')
    update_cell_val('K26', excel_date('2026-08-02'))
    update_cell_val('M26', excel_date('2026-09-30'))
    update_cell_text('O26', 'Repositorio Git con historial de versiones, carpetas de prototipos y documentacion de arquitectura')
    update_cell_text('U26', 'Se evaluaron seis arquitecturas distintas hasta optar por Vanilla desacoplado para eliminar costos fijos')

    update_cell_text('B28', 'Refinamiento final de Barberia_El_Arriero_v3: algoritmo acumulativo, accesibilidad WAI-ARIA, seguridad CSP y Git')
    update_cell_val('K28', excel_date('2026-10-01'))
    update_cell_val('M28', excel_date('2026-10-19'))
    update_cell_text('O28', 'Sitio web publicado en produccion, commits sincronizados en GitHub y documentacion en Normas APA v7')
    update_cell_text('U28', 'Resolucion exitosa de permisos 403 en GitHub y verificacion de rendimiento Lighthouse movil > 90')

    update_cell_text('F45', 'Johan Steven Ibarra Angulo')
    update_cell_val('U45', excel_date('2026-10-19'))

    root_ss.attrib['count'] = str(len(strings_list))
    root_ss.attrib['uniqueCount'] = str(len(strings_list))

    tree_ss.write(ss_path, encoding='utf-8', xml_declaration=True)
    tree_s.write(sheet_path, encoding='utf-8', xml_declaration=True)

    with zipfile.ZipFile(BITA_PATH, 'w', zipfile.ZIP_DEFLATED) as z_out:
        for root, dirs, files in os.walk(tmp_dir):
            for file in files:
                full_p = os.path.join(root, file)
                rel_p = os.path.relpath(full_p, tmp_dir)
                z_out.write(full_p, rel_p)

    shutil.rmtree(tmp_dir)
    print("Bitacora XLSX actualizada exitosamente.")

if __name__ == '__main__':
    update_cronograma()
    update_bitacora()
