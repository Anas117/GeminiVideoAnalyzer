import sqlite3
import datetime
from dataclasses import dataclass
from typing import List, Optional


@dataclass
class Tutorial:
    id: int
    content: str
    uploader: str
    timestamp: str
    transcript: Optional[str] = None
    clips: Optional[str] = None
    video: Optional[str] = None

@dataclass
class Tutorials:
    tutorials: List[Tutorial]

def dataclass_factory(cursor, row):
    fields = [column[0] for column in cursor.description]
    return Tutorial(**{k: v for k, v in zip(fields, row)})

def create_table():
    conn = sqlite3.connect("tutorials.db")
    cursor = conn.cursor()

    cursor.execute('''
               CREATE TABLE IF NOT EXISTS tutorials
               (
                   id
                   INTEGER
                   PRIMARY
                   KEY
                   AUTOINCREMENT,
                   content
                   TEXT
                   NOT
                   NULL,
                   transcript
                   TEXT,
                   uploader
                   TEXT
                   NOT
                   NULL,
                   timestamp
                   TEXT
                   NOT
                   NULL,
                   clips
                   TEXT,
                   video
                   TEXT
               )
               ''')
    conn.commit()

create_table()

def insert_tutorial(content: str, transcript: str, uploader: str):
    try:
        conn = sqlite3.connect("tutorials.db")
        cursor = conn.cursor()

        current_datetime = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")

        insert_sql = "INSERT INTO tutorials (content, transcript, uploader, timestamp) VALUES (?, ?, ?, ?)"

        cursor.execute(insert_sql, (content,transcript,uploader,current_datetime))

        conn.commit()

        print(f"Successfully inserted: '{content}' uploaded by '{uploader}' at {current_datetime}")

    except sqlite3.Error as e:
        print(f"SQLite error: {e}")
        if conn:
            conn.rollback()
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
    finally:
        if conn:
            conn.close()

def insert_video_tutorial(content, clips, video, uploader):
    try:
        conn = sqlite3.connect("tutorials.db")
        cursor = conn.cursor()

        current_datetime = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")

        insert_sql = "INSERT INTO tutorials (content, clips, video, uploader, timestamp) VALUES (?, ?, ?, ?, ?)"

        cursor.execute(insert_sql, (content,clips,video,uploader,current_datetime))

        conn.commit()

        print(f"Successfully inserted: '{content}' uploaded by '{uploader}' at {current_datetime}")

    except sqlite3.Error as e:
        print(f"SQLite error: {e}")
        if conn:
            conn.rollback()
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
    finally:
        if conn:
            conn.close()

def select_tutorials(uploader: str):
    conn = sqlite3.connect("tutorials.db")
    cursor = conn.cursor()
    cursor.row_factory = dataclass_factory
    cursor.execute("SELECT * FROM tutorials WHERE uploader = ?;", [uploader])
    rows = cursor.fetchall()
    conn.close()
    return Tutorials(tutorials=rows)

def update_tutorial(tutorial: Tutorial):
    try:
        conn = sqlite3.connect("tutorials.db")
        cursor = conn.cursor()
        cursor.row_factory = dataclass_factory
        cursor.execute("UPDATE tutorials SET content= ? WHERE id=?", [tutorial.content, tutorial.id])
        conn.commit()
    except sqlite3.Error as e:
        print(f"SQLite error: {e}")
        if conn:
            conn.rollback()
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
    finally:
        if conn:
            conn.close()
