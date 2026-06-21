import { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../api/client";
import { StarsDisplay } from "../components/Stars";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../components/Toast";

interface CommentNode {
  id: number;
  review_id: number;
  user_id: number;
  parent_comment_id: number | null;
  text: string;
  created_at: string;
  replies: CommentNode[];
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function CommentForm({
  reviewId,
  parentId,
  onDone,
  placeholder,
}: {
  reviewId: number;
  parentId: number | null;
  onDone: () => void;
  placeholder: string;
}) {
  const { user } = useAuth();
  const toast = useToast();
  const [text, setText] = useState("");

  async function submit() {
    if (!user) {
      toast("Сначала войдите в систему", "err");
      return;
    }
    if (!text.trim()) {
      toast("Введите текст", "err");
      return;
    }
    try {
      await api.addComment(reviewId, text.trim(), parentId);
      setText("");
      toast("Комментарий добавлен", "ok");
      onDone();
    } catch (e: any) {
      toast(e.message, "err");
    }
  }

  return (
    <div>
      <textarea
        placeholder={placeholder}
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <div style={{ marginTop: 8 }}>
        <button className="btn small" onClick={submit}>
          Отправить
        </button>
      </div>
    </div>
  );
}

function CommentItem({
  node,
  reviewId,
  reload,
}: {
  node: CommentNode;
  reviewId: number;
  reload: () => void;
}) {
  const [replyOpen, setReplyOpen] = useState(false);
  return (
    <div className="comment-node">
      <div className="comment-body">
        <div className="comment-meta">
          Пользователь #{node.user_id} · {fmtDate(node.created_at)}
        </div>
        <div>{node.text}</div>
        <span className="reply-link" onClick={() => setReplyOpen((v) => !v)}>
          Ответить
        </span>
        {replyOpen && (
          <div className="reply-mount">
            <CommentForm
              reviewId={reviewId}
              parentId={node.id}
              placeholder="Ваш ответ..."
              onDone={() => {
                setReplyOpen(false);
                reload();
              }}
            />
          </div>
        )}
      </div>
      {node.replies.length > 0 && (
        <div className="comment-children">
          {node.replies.map((ch) => (
            <CommentItem key={ch.id} node={ch} reviewId={reviewId} reload={reload} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function ReviewPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const toast = useToast();
  const [review, setReview] = useState<any>(null);
  const [tree, setTree] = useState<CommentNode[]>([]);
  const [notFound, setNotFound] = useState(false);

  const loadComments = useCallback(() => {
    if (!id) return;
    api.comments(id).then(setTree).catch(() => setTree([]));
  }, [id]);

  useEffect(() => {
    api
      .review(id!)
      .then(setReview)
      .catch(() => setNotFound(true));
    loadComments();
  }, [id, loadComments]);

  async function markUseful() {
    if (!user) {
      toast("Сначала войдите в систему", "err");
      return;
    }
    try {
      await api.feedback(review.id);
      toast("Спасибо за оценку полезности", "ok");
    } catch (e: any) {
      toast(e.message, "err");
    }
  }

  if (notFound) return <div className="empty">Отзыв не найден.</div>;
  if (!review) return <div className="spinner" />;

  return (
    <div className="view">
      <div className="page-head">
        <div>
          <h1>Отзыв о товаре #{review.product_id}</h1>
        </div>
        <Link className="btn ghost small" to="/search">
          К поиску
        </Link>
      </div>

      <div className="card">
        <div className="split" style={{ justifyContent: "space-between" }}>
          <div className="score-pill" style={{ fontSize: 18 }}>
            <StarsDisplay value={review.score_total} />
            {review.score_total != null ? review.score_total.toFixed(2) : "—"} из 5
          </div>
          <button className="btn small secondary" onClick={markUseful}>
            Отзыв полезен
          </button>
        </div>
        <div className="divider" />
        <div className="grid-2">
          <div>
            <div className="kv">
              <span>Сервис / площадка</span>
              <b>{review.score_service} / 5</b>
            </div>
            <div className="kv">
              <span>Продавец</span>
              <b>{review.score_seller} / 5</b>
            </div>
          </div>
          <div>
            <div className="kv">
              <span>Товар</span>
              <b>{review.score_product} / 5</b>
            </div>
            <div className="kv">
              <span>Доставка</span>
              <b>{review.score_delivery} / 5</b>
            </div>
          </div>
        </div>
        {review.comment_text && (
          <>
            <div className="divider" />
            <p>{review.comment_text}</p>
          </>
        )}
        <div className="muted" style={{ fontSize: 12 }}>
          {fmtDate(review.created_at)}
        </div>
      </div>

      <div className="card">
        <h2>Обсуждение</h2>
        <p className="hint">Оставляйте комментарии и отвечайте на них</p>
        <CommentForm
          reviewId={review.id}
          parentId={null}
          placeholder="Ваш комментарий..."
          onDone={loadComments}
        />
        <div style={{ marginTop: 8 }}>
          {tree.length === 0 ? (
            <div className="empty">Пока нет комментариев. Будьте первым.</div>
          ) : (
            tree.map((node) => (
              <CommentItem key={node.id} node={node} reviewId={review.id} reload={loadComments} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
