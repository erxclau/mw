"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import SQLJS, { type Database } from "sql.js";

import Input from "./components/input";
import Stage from "./components/stage";
import Counter from "./components/counter";
import Button from "./components/button";
import { numberFormatter } from "./format";
import { StageContext } from "./context";

export default function Home() {
  const sql = useRef<SQLJS.SqlJsStatic>(null);
  const [messages, setMessages] = useState<Database>();
  const [contacts, setContacts] = useState<Map<string, string>>();

  const [stage, setStage] = useState<number>();
  const [shown, setShown] = useState<number>();

  useEffect(() => {
    SQLJS({
      locateFile: (file) =>
        "https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.12.0/" + file,
    })
      .then((r) => {
        sql.current = r;
      })
      .catch((e) => {
        console.error(e);
      });
  }, []);

  const results = useMemo(() => {
    if (messages === undefined || contacts === undefined) {
      return null;
    }

    const [
      {
        values: [[totalMessages]],
      },
      {
        values: [[totalSentMessages]],
      },
      {
        values: [[totalSentMessagesPreviousYear]],
      },
      { values: topMessages },
      { values: topSentConversations },
      { values: topReceivedConversations },
    ] = messages.exec(`
      SELECT COUNT(*) FROM messages_2024;
      SELECT COUNT(*) FROM messages_2024 WHERE is_from_me = 1;
      SELECT COUNT(*) FROM message WHERE strftime('%Y', date / 1000000000, 'unixepoch', '+31 years') = '2023' AND is_from_me = 1;
      SELECT trim(text), COUNT(*) FROM messages_2024 WHERE is_from_me = 1 AND text IS NOT NULL AND length(trim(text)) > 0 GROUP BY trim(text) ORDER BY COUNT(*) DESC LIMIT 5;
      SELECT c.group_id, c.chat_identifier, c.display_name, COUNT(*) FROM messages_2024 m, chat_message_join j, chat c WHERE m.is_from_me = 1 AND m.ROWID = j.message_id AND c.ROWID = j.chat_id GROUP BY c.group_id ORDER BY COUNT(*) DESC LIMIT 5;
      SELECT c.group_id, c.chat_identifier, c.display_name, COUNT(*) FROM messages_2024 m, chat_message_join j, chat c WHERE m.is_from_me = 0 AND m.ROWID = j.message_id AND c.ROWID = j.chat_id GROUP BY c.group_id ORDER BY COUNT(*) DESC LIMIT 5
    `);

    const change =
      (((totalSentMessages as number) -
        (totalSentMessagesPreviousYear as number)) /
        (totalSentMessagesPreviousYear as number)) *
      100;

    return {
      totalMessages: totalMessages as number,
      totalSentMessages: totalSentMessages as number,
      change,
      changeDirection:
        (totalSentMessages as number) >
        (totalSentMessagesPreviousYear as number)
          ? "increase"
          : "decrease",
      topMessages,
      topSentConversations: topSentConversations.map((conversation) => ({
        data: conversation,
        contact:
          contacts.get(conversation[1] as string) ||
          conversation[2] ||
          conversation[1],
      })),
      topReceivedConversations: topReceivedConversations.map(
        (conversation) => ({
          data: conversation,
          contact:
            contacts.get(conversation[1] as string) ||
            conversation[2] ||
            conversation[1],
        })
      ),
    };
  }, [messages, contacts]);

  useEffect(() => {
    if (results === null) {
      return;
    }

    setShown(0);
  }, [results]);

  return (
    <section className="max-w-96 m-auto w-full">
      <StageContext value={{ stage, shown }}>
        <Stage
          stage={undefined}
          onComplete={() => {
            setStage(0);
          }}
        >
          <Input
            label="Upload your messages"
            hint="Users/username/Library/Messages/chat.db"
            accept=".db"
            onUpload={(buffer) => {
              if (sql.current === null) {
                return;
              }

              const db = new sql.current.Database(buffer);
              db.run("UPDATE message SET text = replace(text, '￼', ' ')");
              db.run(
                "CREATE VIEW messages_2024 AS SELECT * FROM message WHERE strftime('%Y', date / 1000000000, 'unixepoch', '+31 years') = '2024' AND associated_message_type = 0"
              );

              setMessages(db);
            }}
          />
          <Input
            label="Upload your contacts"
            hint="Users/username/Library/Application Support/AddressBook/Sources/*/AddressBook-v22.abcddb"
            accept=".abcddb"
            onUpload={(buffer) => {
              if (sql.current === null) {
                return;
              }

              const db = new sql.current.Database(buffer);

              const [{ values }] = db.exec(
                "SELECT p.ZFULLNUMBER, r.ZFIRSTNAME, r.ZLASTNAME FROM ZABCDPHONENUMBER p, ZABCDRECORD r WHERE p.ZOWNER = r.Z_PK"
              );

              const contacts = new Map();

              for (const contact of values) {
                let phone = (contact[0] as string)
                  .replace("(", "")
                  .replace(")", "")
                  .replaceAll("-", "")
                  .replaceAll(" ", "");
                if (!phone.startsWith("+")) {
                  phone = "+1" + phone;
                }

                contacts.set(phone, contact[1] + " " + contact[2]);
              }

              setContacts(contacts);
            }}
          />
          <small className="text-white">
            <a
              href="https://discussions.apple.com/thread/254002152"
              className="underline decoration-dashed"
            >
              Don&apos;t see your Library folder?
            </a>
          </small>
        </Stage>

        <Stage stage={0} onComplete={() => setStage(1)}>
          <div className="text-white text-2xl text-balance">
            Your conversations from 2024 included{" "}
            <Counter number={results?.totalMessages} /> texts.
          </div>
          <Button delay={3000} onClick={() => setShown(1)}>
            Start your story
          </Button>
        </Stage>

        <Stage stage={1} onComplete={() => setStage(2)}>
          <div className="flex flex-col gap-1">
            <div className="text-white text-2xl text-balance">
              You sent <Counter number={results?.totalSentMessages} /> messages
              this year.
            </div>
            <div
              className="text-white text-2xl text-balance fade"
              style={{ transitionDelay: "2.75s" }}
            >
              That&apos;s a{" "}
              <b>{numberFormatter.format(results?.change ?? 0)}%</b>{" "}
              {results?.changeDirection} from last year.
            </div>
          </div>
          <Button delay={3500} onClick={() => setShown(2)} />
        </Stage>

        <Stage stage={2} onComplete={() => setStage(3)}>
          <div className="flex flex-col gap-1">
            <p className="text-white text-2xl text-balance">
              You love sending this text the most:
            </p>
            <div
              className="text-white text-4xl fade"
              style={{ transitionDelay: "2s" }}
            >
              {results?.topMessages[0][0]}
            </div>
            <p
              className="text-white text-2xl text-balance fade"
              style={{ transitionDelay: "2s" }}
            >
              You sent it{" "}
              <b>
                {numberFormatter.format(
                  (results?.topMessages[0][1] as number | undefined) ?? 0
                )}
              </b>{" "}
              times this year.
            </p>
          </div>
          <Button delay={3000} onClick={() => setShown(3)} />
        </Stage>

        <Stage stage={3} onComplete={() => setStage(4)}>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <p className="text-white text-2xl text-balance">
                You sent{" "}
                {numberFormatter.format(
                  (results?.topSentConversations[0].data[3] as
                    | number
                    | undefined) ?? 0
                )}{" "}
                messages to...
              </p>
              <p
                className="text-white text-4xl fade font-bold"
                style={{ transitionDelay: "2s" }}
              >
                {results?.topSentConversations[0].contact}
              </p>
              <p
                className="text-white text-2xl fade"
                style={{ transitionDelay: "2s" }}
              >
                That&apos;s the most of any conversation this year!
              </p>
            </div>
            <div className="fade" style={{ transitionDelay: "3s" }}>
              <ol className="list-decimal">
                {results?.topSentConversations.map((conversation) => {
                  return (
                    <li
                      key={String(conversation.contact)}
                      className="text-white text-xl"
                    >
                      <div>{conversation.contact}</div>
                      <small>
                        {numberFormatter.format(
                          (conversation.data[3] as number | undefined) ?? 0
                        )}
                      </small>
                    </li>
                  );
                })}
              </ol>
            </div>
          </div>
          <Button delay={3000} onClick={() => setShown(4)} />
        </Stage>

        <Stage stage={4} onComplete={() => setStage(4)}>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <p className="text-white text-2xl text-balance">
                You received{" "}
                {numberFormatter.format(
                  (results?.topReceivedConversations[0].data[3] as
                    | number
                    | undefined) ?? 0
                )}{" "}
                messages from...
              </p>
              <p
                className="text-white text-4xl fade font-bold"
                style={{ transitionDelay: "2s" }}
              >
                {results?.topReceivedConversations[0].contact}
              </p>
              <p
                className="text-white text-2xl fade"
                style={{ transitionDelay: "2s" }}
              >
                That&apos;s the most your conversations in 2024.
              </p>
            </div>
            <div className="fade" style={{ transitionDelay: "3s" }}>
              <ol className="list-decimal">
                {results?.topReceivedConversations.map((conversation) => {
                  return (
                    <li
                      key={String(conversation.contact)}
                      className="text-white text-xl"
                    >
                      <div>{conversation.contact}</div>
                      <small>
                        {numberFormatter.format(
                          (conversation.data[3] as number | undefined) ?? 0
                        )}
                      </small>
                    </li>
                  );
                })}
              </ol>
            </div>
          </div>
        </Stage>
      </StageContext>
    </section>
  );
}
